import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000';
const CHAT_URL = `${BASE_URL}/chat`;

export const options = {
  vus: 500,
  duration: '2m',
  thresholds: {
    http_req_failed: ['rate<0.01'],  // <1% de errores aceptables
    http_req_duration: ['p(95)<2000'], // 95% respuestas < 2s (como referencia)
  },
};

export default function () {
  const res = http.get(CHAT_URL);

  check(res, {
    'Chat accesible': (r) => r.status === 200,
  });

  sleep(1);  // espera 1s entre peticiones para simular usuarios reales
}
