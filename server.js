/*jshint esversion: 6*/
const http = require('http');
const fs = require('fs');

const checkPath = (path) => {
  if (path === '/') {
    path = '/index.html';
  }
  return path;
};

const sendError = (res) => {
  fs.readFile(`public/404.html`, (err, data) => {
    return writeErrorResponse(data, res);
  });
};

const writeErrorResponse = (data, res) => {
  res.writeHead(404, {
    'Content-Length' : data.length,
    'Content-Type' : 'text/html'
  });
  res.end(data);
};

const writeSuccessResponse = (data, res) => {
  res.writeHead(200, {
    'Content-Length' : data.length,
    'Content-Type' : 'text/html'
  });
  res.end(data);
};

const getMethod = (path, res) => {
  fs.readFile(`public${checkPath(path)}`, (err, data) => {
    if (err) return sendError(res);

    return writeSuccessResponse(data, res);
  });
};

const server = http.createServer((req, res) => {
  switch(req.method) {
    case 'GET' :
      getMethod(req.url, res);
      break;
    case 'POST' :
      break;
    case 'PUT' :
      break;
    case 'DELETE' :
      break;
  }
});

server.listen(8888, () => {
  console.log("Server has started!");
});
