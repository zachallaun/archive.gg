import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw 'process.env.DATABASE_URL must be set';
}

export function query({ text, values }) {
  if (!text) {
    throw 'query requires text parameter';
  }

  return new Promise((resolve, reject) => {
    pg.connect(DATABASE_URL, (err, client, done) => {
      if (err) {
        console.error('ERROR fetching from client pool', err);
        return reject(err);
      }

      client.query(text, values, (err, { rows } = {}) => {
        if (err) {
          console.error('ERROR during query', err);
          console.error(sql);
          return reject(err);
        }

        resolve(rows);
      });
    });
  });
}
