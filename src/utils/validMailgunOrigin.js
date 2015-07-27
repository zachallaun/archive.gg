import crypto from 'crypto';
import secureCompare from 'utils/secureCompare';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;

if (!MAILGUN_API_KEY) {
  console.error('process.env.MAILGUN_API_KEY must be set');
}

export default function validMailgunOrigin({ timestamp, token, signature }) {
  if (!timestamp || !token || !signature) {
    return false;
  }

  const adjustedTimestamp = parseInt(timestamp, 10) * 1000;
  const hexdigest = crypto
    .createHmac('sha256', MAILGUN_API_KEY)
    .update(new Buffer(timestamp + token, 'utf-8'))
    .digest('hex');

  return secureCompare(signature, hexdigest);
}
