const http = require('http');
const port = 8080;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Hello from OpenShift!</h1>');
}).listen(port, () => console.log('Running on port ' + port));
