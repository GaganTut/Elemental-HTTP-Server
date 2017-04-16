/*jshint esversion: 6*/
const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const getMethod = (path, res) => {
  if (path.indexOf('/css') === 0) {
    return findCSS(path, res);
  }
  fs.readFile(`public${checkPath(path)}`, (err, data) => {
    if (err) return sendError(res);

    return writeSuccessResponse(data, res);
  });
};

const checkPath = (path) => {
  if (path === '/') {
    path = '/index.html';
  }
  return path;
};

const writeSuccessResponse = (data, res) => {
  res.writeHead(200, {
    'Content-Length' : data.length,
    'Content-Type' : 'text/html'
  });
  res.end(data);
};

const writeErrorResponse = (data, res) => {
  res.writeHead(404, {
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

const findCSS = (path, res) => {
  fs.readFile(`public${checkPath(path)}`, (err, data) => {
    if (err) return;

    return writeCSSResponse(data, res);
  });
};

const writeCSSResponse = (data, res) => {
  res.writeHead(200, {
    'Content-Length' : data.length,
    'Content-Type' : 'text/css'
  });
  res.end(data);
};
//--------------------------------------------------------------------------------------------
const postMethod = (body, res) => {
  const bodyData = body.toString().split('&');
  const bodyObj = {};

  for (let i = 0; i < bodyData.length; i++) {
    bodyObj[bodyData[i].split('=')[0]] = bodyData[i].split('=')[1].split("+").join(' ');
  }

  if (bodyObj.hasOwnProperty('elementName') && bodyObj.hasOwnProperty('elementSymbol') && bodyObj.hasOwnProperty('elementAtomicNumber') && bodyObj.hasOwnProperty('elementDescription')) {
    createFile(bodyObj, res);
  } else {
    sendError(res);
  }
};



const server = http.createServer((req, res) => {
  switch(req.method) {
    case 'GET' :
      getMethod(req.url, res);
      break;
    case 'POST' :
      if (req.url !== '/elements') {
        sendError(res);
      } else {
        req.on('data', (data) => {
          postMethod(data, res);
        });
      }
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

const createFile = (bodyObj, res) => {
  fs.writeFile(`public/${bodyObj.elementName}.html`, makeFileData(bodyObj), (err) => {
    if (err) sendError(res);

    let success = JSON.stringify({"success": true});
    res.writeHead(200, {
      'Content-Length' : success.length,
      'Content-Type' : 'application/json'
    });

    updateIndex(bodyObj);
  });
};

const makeFileData = (bodyObj) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${bodyObj.elementName}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${bodyObj.elementName}</h1>
  <h2>${bodyObj.elementSymbol}</h2>
  <h3>Atomic number ${bodyObj.elementAtomicNumber}</h3>
  <p>${bodyObj.elementDescription}</p>
  <p><a href="/">back</a></p>
</body>
</html>`;
};

const updateIndex = (bodyObj) => {

};