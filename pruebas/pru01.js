import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/login`;
const CHAT_URL = `${BASE_URL}/chat`;

const USER_CREDENTIALS = [
    { correo: 'manvepa@gmail.com', password: '123' }
];

export const options = {
    vus: 100,
    duration: '1m',
    thresholds: {
        'http_req_duration': ['p(95)<1000'],
    },
};

export default function () {
    const user = USER_CREDENTIALS[__VU % USER_CREDENTIALS.length];

    group('Autenticación', () => {
        const loginPayload = JSON.stringify({
            correo: user.correo,
            password: user.password,
        });

        console.log(`Enviando login para: ${user.correo}`);
        console.log(`Payload enviado: ${loginPayload}`);

        const loginRes = http.post(LOGIN_URL, loginPayload, {
            headers: { 'Content-Type': 'application/json' },
        });

        console.log(`Status login: ${loginRes.status}`);
        console.log(`Headers login: ${JSON.stringify(loginRes.headers)}`);
        console.log(`Body login: ${loginRes.body}`);

        let token = null;
        try {
            token = loginRes.json('token');
        } catch (e) {
            console.error('Error parseando JSON de respuesta login:', e);
            console.log('Respuesta cruda:', loginRes.body);
            return;
        }

        check(loginRes, {
            'Login exitoso': (r) => r.status === 200 && token !== null,
        });

        if (!token) {
            console.error(`No se obtuvo el token para ${user.correo}`);
            return;
        }

        const jar = http.cookieJar();
        jar.set(LOGIN_URL, 'jwt', token);

        group('Acceso al chat', () => {
            const chatRes = http.get(CHAT_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                cookies: jar.cookiesForURL(CHAT_URL),
            });

            console.log(`Respuesta chat (status ${chatRes.status}): ${chatRes.body}`);

            check(chatRes, {
                'Acceso al chat exitoso': (r) => r.status === 200,
            });
        });
    });

    sleep(1);
}
