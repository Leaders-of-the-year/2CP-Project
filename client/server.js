
const fs = require('fs');
const https = require('https');
const path = require('path');
const next = require('next');

// Define SSL certificate paths
const keyPath = path.join(__dirname, 'key.pem');
const certPath = path.join(__dirname, 'cert.pem');

// Set up Next.js app
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Read the SSL certificates
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};
// TO DO : CHANGE '0.0.0.0' to your server IP address that you want to bind to
app.prepare().then(() => {
  https
    .createServer(options, (req, res) => {
      handle(req, res);
    })
    .listen(3000,'0.0.0.0', (err) => {
      if (err) throw err;
      console.log('> Ready on https://192.168.43.25:3000');
    });
});
