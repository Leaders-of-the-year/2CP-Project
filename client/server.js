const fs = require('fs');
const https = require('https');
const path = require('path');
const next = require('next');
const dotenv = require('dotenv');
dotenv.config();
const CLIENT_PORT = process.env.CLIENT_PORT || 3000;
const CLIENT_IP = process.env.CLIENT_IP || 'localhost';
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
    .listen(CLIENT_PORT, "0.0.0.0", (err) => {
      if (err) throw err;
      console.log(`> Ready on https://${CLIENT_IP}:${CLIENT_PORT}`);
    });
});
