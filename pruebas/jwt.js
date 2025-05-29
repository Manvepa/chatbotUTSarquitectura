import crypto from 'k6/crypto';
import encoding from 'k6/encoding';

const algToHash = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
};

function sign(data, hashAlg, secret) {
  const hasher = crypto.createHMAC(hashAlg, secret);
  hasher.update(data);
  return hasher.digest('base64rawurl');
}

export function encode(payload, secret, algorithm = 'HS256') {
  const header = encoding.b64encode(JSON.stringify({ typ: 'JWT', alg: algorithm }), 'rawurl');
  payload = encoding.b64encode(JSON.stringify(payload), 'rawurl');
  const sig = sign(header + '.' + payload, algToHash[algorithm], secret);
  return [header, payload, sig].join('.');
}
