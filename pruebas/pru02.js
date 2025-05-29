import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/login`;
const CHAT_URL = `${BASE_URL}/chat`;

const USER_CREDENTIALS = [
    { correo: 'manvepa@gmail.com', password: '123' }
];

export const options = {
    vus: 500, // 500 usuarios concurrentes
    duration: '3m', // prueba prolongada
    thresholds: {
        http_req_failed: ['rate<0.01'],        // menos del 1% de fallos
        http_req_duration: ['p(95)<4000'],     // 95% de peticiones bajo 4s
    },
};

export default function () {
    const user = USER_CREDENTIALS[__VU % USER_CREDENTIALS.length];

    group('Autenticación', () => {
        const loginPayload = JSON.stringify({
            correo: user.correo,
            password: user.password,
        });

        const loginRes = http.post(LOGIN_URL, loginPayload, {
            headers: { 'Content-Type': 'application/json' },
        });

        check(loginRes, {
            'Login exitoso': (r) => r.status === 200 && r.json('token') !== undefined,
        });

        const token = loginRes.json('token');
        if (!token) {
            return;
        }

        group('Acciones en el sistema - tráfico mixto', () => {
            const res = http.get(CHAT_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            check(res, {
                'Acceso al chat exitoso': (r) => r.status === 200,
            });

            // Puedes añadir más rutas aquí para simular tráfico mixto
        });
    });

    sleep(Math.random() * 3); // Simula tiempos variables entre acciones
}
