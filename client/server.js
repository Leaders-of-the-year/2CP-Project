import fs from 'fs';
import https from 'https';
import path from 'path';
import next from 'next';
import {CLIENT_IP,CLIENT_PORT} from './config.js';
const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.prepare().then(() => {
  https
    .createServer(options, (req, res) => {
      handle(req, res);
    })
    .listen(CLIENT_PORT,`${CLIENT_IP}`, (err) => {
      if (err) throw err;
      console.log(`> Ready on https://${CLIENT_PORT}:${CLIENT_IP}`);
    });
});
