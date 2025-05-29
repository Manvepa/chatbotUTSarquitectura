import http from 'k6/http';
import { check, sleep } from 'k6';

const EXTERNAL_API_URL = 'https://jsonplaceholder.typicode.com/posts/1';

export const options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(EXTERNAL_API_URL);

  check(res, {
    'API externa respondió con status 200': (r) => r.status === 200,
  });

  sleep(1);
}
