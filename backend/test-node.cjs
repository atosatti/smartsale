const http = require('http');

console.log('[PURE-NODE] Iniciando...');

const server = http.createServer((req, res) => {
  console.log(`[PURE-NODE] GET ${req.url}`);
  res.writeHead(200);
  res.end('OK');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('[PURE-NODE] ✅ Servidor em http://0.0.0.0:3000');
});
