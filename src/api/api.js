import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import config from '../config';
import actions from './routes/index';

const app = express();
app.use(session({
  secret: 'abcdefg1234567',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 },
}));
app.use(bodyParser.json());

export default function api() {
  return new Promise((resolve) => {
    Object.keys(actions).forEach(action => {
      app.use(`/${action}`, actions[action]);
    });

    app.use((req, res) => {
      res.status(404).end('NOT FOUND');
    });

    app.listen(config.apiPort);
    resolve();
  });
}
