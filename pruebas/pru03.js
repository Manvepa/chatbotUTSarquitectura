import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/login`;
const CHAT_URL = `${BASE_URL}/chat`;

const USER_CREDENTIALS = [
    { correo: 'manvepa@gmail.com', password: '123' }
];

export const options = {
    stages: [
        { duration: '1m', target: 100 },   // Subida inicial
        { duration: '1m', target: 500 },   // Subida moderada
        { duration: '1m', target: 1000 },  // Subida fuerte
        { duration: '2m', target: 1500 },  // Punto de estrés
        { duration: '1m', target: 500 },   // Descenso para recuperación
        { duration: '1m', target: 0 },     // Finalización gradual
    ],
    thresholds: {
        http_req_failed: ['rate<0.05'],        // toleramos hasta 5% de errores bajo estrés
        http_req_duration: ['p(95)<10000'],    // se permite más tiempo en condiciones extremas
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

        group('Tráfico del usuario - Acceso a chat', () => {
            const res = http.get(CHAT_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            check(res, {
                'Acceso al chat exitoso': (r) => r.status === 200,
            });
        });
    });

    sleep(Math.random() * 3); // simula usuarios con tiempos irregulares
}
