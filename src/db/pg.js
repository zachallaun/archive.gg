import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('process.env.DATABASE_URL must be set');
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

      const start = Date.now();

      client.query(text, values, (err, response) => {
        if (err) {
          console.error('DB ERROR during query', err);
          console.error(text, values);
          return reject(err);
        } else {
          console.info(`DB (${Date.now() - start}ms): ${text} ${values}`);
        }

        resolve(response.rows);
      });
    });
  });
}
