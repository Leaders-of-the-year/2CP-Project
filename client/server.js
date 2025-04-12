const fs = require('fs');
const https = require('https');
const path = require('path');
const next = require('next');
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
    .listen(3000,'192.168.74.215', (err) => {
      if (err) throw err;
      console.log('> Ready on https://192.168.43.25:3000');
    });
});
