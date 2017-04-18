/*jshint esversion: 6*/
const writeSuccessResponse = (data, res) => {
  res.writeHead(200, {
    'Content-Length' : data.length,
    'Content-Type' : 'text/html'
  });
  res.end(data);
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


module.exports = {
  writeSuccessResponse,
  sendError,
};