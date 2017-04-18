/*jshint esversion: 6*/
const helpers = require('helpers.js');

module.exports = (req, res) => {
  if (req.url.indexOf('/css') === 0)
    return findCSS(req, res);

  fs.readFile(`public${checkPath(req.url)}`, (err, data) => {
    if (err) return helpers.sendError(res);

    helpers.writeSuccessResponse(data, res);
  });
};

const checkPath = (path) => {
  if (path === '/')
    return (path = '/index.html');

  else if (path.indexOf('.html') === -1)
    return path += '.html';

  return path;
};

const findCSS = (req, res) => {
  fs.readFile(`public${checkPath(req.url)}`, (err, data) => {
    if (err) return;

    writeCSSResponse(data, res);
  });
};

const writeCSSResponse = (data, res) => {
  res.writeHead(200, {
    'Content-Length' : data.length,
    'Content-Type' : 'text/css'
  });
  res.end(data);
};