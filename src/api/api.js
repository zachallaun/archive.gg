import express from 'express';
import bodyParser from 'body-parser';
import config from '../config';
import actions from './routes/index';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
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
