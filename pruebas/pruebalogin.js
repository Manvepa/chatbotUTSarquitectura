import http from 'k6/http';
import { check, group } from 'k6';

const BASE_URL = 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/login`;

export const options = {
    vus: 1,
    iterations: 1,
};

export default function () {
    group('PRU-01 - Login sin contraseña', () => {
        const payload = JSON.stringify({
            correo: 'usuario1',
            password: ''
        });

        const res = http.post(LOGIN_URL, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        const error = res.json('error');

        console.log('PRU-01 status:', res.status);
        console.log('PRU-01 body:', res.body);

        check(res, {
            'Status es 401': (r) => r.status === 401,
            'Mensaje de error esperado': () => error === 'Invalid email or password',
        });
    });

    group('PRU-02 - Login sin usuario', () => {
        const payload = JSON.stringify({
            correo: '',
            password: '123456'
        });

        const res = http.post(LOGIN_URL, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        const error = res.json('error');

        console.log('PRU-02 status:', res.status);
        console.log('PRU-02 body:', res.body);

        check(res, {
            'Status es 401': (r) => r.status === 401,
            'Mensaje de error esperado': () => error === 'Invalid email or password',
        });
    });

    group('PRU-03 - Usuario no registrado', () => {
        const payload = JSON.stringify({
            correo: 'no_existe',
            password: 'cualquier'
        });

        const res = http.post(LOGIN_URL, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        const error = res.json('error');

        console.log('PRU-03 status:', res.status);
        console.log('PRU-03 body:', res.body);

        check(res, {
            'Status es 401': (r) => r.status === 401,
            'Mensaje de error esperado': () => error === 'Invalid email or password',
        });
    });
}
