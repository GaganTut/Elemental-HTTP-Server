/*jshint esversion: 6*/
const http = require('http');
const fs = require('fs');

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



const postMethod = (body, res) => {
  const bodyData = body.toString().split('&');
  const bodyObj = {};

  for (let i = 0; i < bodyData.length; i++) {
    bodyObj[bodyData[i].split('=')[0]] = bodyData[i].split('=')[1].split("+").join(' ');
  }

  if (checkBodyObj(bodyObj)) {
    createFile(bodyObj, res);
  } else {
    sendError(res);
  }
};

const putMethod = (body, req, res) => {
  if (checkExistance(req.url)) {
    editExistingFile(body, req, res);
  } else {
    let errorMsg = JSON.stringify({"error": "resource " + req.url + " does not exist"});
    res.writeHead(500, {
      'Content-Length' : errorMsg.length,
      'Content-Type': 'application/json'
    });
    res.end(errorMsg);
  }
};

const deleteMethod = (path, res) => {
  if (checkExistance(path)) {
    fs.unlink(`public${path}`);
    deleteFromIndex(path, res);
  } else {
    let errorMsg = JSON.stringify({"error": "resource " + path + " does not exist"});
    res.writeHead(500, {
      'Content-Length' : errorMsg.length,
      'Content-Type': 'application/json'
    });
    res.end(errorMsg);
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
      req.on('data', (data) => {
          putMethod(data, req, res);
        });
      break;
    case 'DELETE' :
      deleteMethod(req.url, res);
      break;
  }
});

server.listen(8888, () => {
  console.log("Server has started!");
});

const createFile = (bodyObj, res) => {
  if(checkExistance(`/${bodyObj.elementName}.html`)) {
    sendError(res);
  } else {
    fs.writeFile(`public/${bodyObj.elementName}.html`, makeFileData(bodyObj), (err) => {
      if (err) sendError(res);

      let success = JSON.stringify({"success": true});
      res.writeHead(200, {
        'Content-Length' : success.length,
        'Content-Type' : 'application/json'
      });
      res.end(success);

      updateIndexList(bodyObj);
    });
  }
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

const updateIndexList = (bodyObj) => {
  fs.readFile('public/index.html', (err, data) => {
    if (err) return sendError(res);

    let newListTag = `    <li>
      <a href="/${bodyObj.elementName}.html">${bodyObj.elementName}</a>
    </li>`;
    let newIndex = data.toString().split('\n');
    newIndex.splice(12, 0, newListTag);
    newIndex = newIndex.join('\n').split('\n');
    let numOfElements = (newIndex.length - 15)/3;
    newIndex.splice(10, 1, `  <h3>There are ${numOfElements}</h3>`);
    newIndex = newIndex.join('\n');

    fs.writeFile('public/index.html', newIndex);
  });
};

const checkExistance = (path) => {
  return fs.existsSync(`public${path}`);
};

const checkBodyObj = (bodyObj) => {
  return bodyObj.hasOwnProperty('elementName') && bodyObj.hasOwnProperty('elementSymbol') && bodyObj.hasOwnProperty('elementAtomicNumber') && bodyObj.hasOwnProperty('elementDescription');
};

const editExistingFile = (body, req, res) => {
  const bodyData = body.toString().split('&');
  const bodyObj = {};

  for (let i = 0; i < bodyData.length; i++) {
    bodyObj[bodyData[i].split('=')[0]] = bodyData[i].split('=')[1].split("+").join(' ');
  }

  if (checkBodyObj(bodyObj)) {
    editFile(bodyObj, res);
  } else {
    sendError(res);
  }
};

const editFile = (bodyObj, res) => {
  fs.writeFile(`public/${bodyObj.elementName}.html`, makeFileData(bodyObj), (err) => {
    if (err) sendError(res);

    let success = JSON.stringify({"success": true});
    res.writeHead(200, {
      'Content-Length' : success.length,
      'Content-Type' : 'application/json'
    });
    res.end(success);
  });
};

const deleteFromIndex = (path, res) => {
  fs.readFile('public/index.html', (err, data) => {
    if (err) throw err;

    let newIndex = data.toString().split('\n');
    for (let i = 0; i < newIndex.length; i++) {
      if (newIndex[i].indexOf(path.slice(1, -5)) > -1) {
        newIndex.splice(i - 1, 3);
        break;
      }
    }

    let numOfElements = (newIndex.length - 15)/3;
    newIndex.splice(10, 1, `  <h3>There are ${numOfElements}</h3>`);
    newIndex = newIndex.join('\n');
    fs.writeFile('public/index.html', newIndex);

    let success = JSON.stringify({"success": true});
      res.writeHead(200, {
        'Content-Length' : success.length,
        'Content-Type' : 'application/json'
      });
      res.end(success);
  });
};