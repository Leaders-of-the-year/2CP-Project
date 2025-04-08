
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

app.prepare().then(() => {
  https
    .createServer(options, (req, res) => {
      handle(req, res);
    })
    .listen(3000, (err) => {
      if (err) throw err;
      console.log('> Ready on https://localhost:3000');
    });
});
