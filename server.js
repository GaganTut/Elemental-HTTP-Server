/*jshint esversion: 6*/
const http = require('http');
const fs = require('fs');

//THE FOUR BASIC FUNCTIONS

//GET METHOD
const getMethod = (path, res) => {
  if (path.indexOf('/css') === 0) {
    return findCSS(path, res);
  }
  fs.readFile(`public${checkPath(path)}`, (err, data) => {
    if (err) return sendError(res);

    return writeSuccessResponse(data, res);
  });
};
//POST METHOD
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
//PUT METHOD
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
//DELETE METHOD
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

//BASIC AUTHENTICATION

const authenticateRequest = (req) => {
  let decodedAttempt = new Buffer(req.headers.authorization.slice(6), 'base64').toString();

  if(decodedAttempt === 'basic:authentication') {
    return true;
  } else {
    return false;
  }
};

const wrongAuthResponse = (res) => {
  res.writeHead(401, {});
  res.end('<html><body>Invalid Authentication Credentials</body></html>');
};

//FUNCTION FOR WHEN SERVER STARTS AND RECEIVES REQUESTS
const server = http.createServer((req, res) => {
  switch(req.method) {
    case 'GET' :
      getMethod(req.url, res);
      break;
    case 'POST' :
      if (authenticateRequest(req)) {
        if (req.url !== '/elements') {
          sendError(res);
        } else {
          req.on('data', (data) => {
            postMethod(data, res);
          });
        }
      } else {
        wrongAuthResponse(res);
      }
      break;
    case 'PUT' :
      if (authenticateRequest(req)) {
        req.on('data', (data) => {
          putMethod(data, req, res);
        });
      } else {
        wrongAuthResponse(res);
      }
      break;
    case 'DELETE' :
      if (authenticateRequest(req)) {
        deleteMethod(req.url, res);
      } else {
        wrongAuthResponse(res);
      }
      break;
  }
});

server.listen(8888, () => {
  console.log("Server has started!");
});
//ALL HELPER FUNCTIONS

//CHECK PATH FOR GET FUNCTION TO SEND TO INDEX WHEN NO PATH IS SPECIFIED
const checkPath = (path) => {
  if (path === '/') {
    path = '/index.html';
  }
  return path;
};
//RETURN SUCCESSFUL GET RESPONSE
const writeSuccessResponse = (data, res) => {
  res.writeHead(200, {
    'Content-Length' : data.length,
    'Content-Type' : 'text/html'
  });
  res.end(data);
};

//FIND AND READ CSS FILE
const findCSS = (path, res) => {
  fs.readFile(`public${checkPath(path)}`, (err, data) => {
    if (err) return;

    return writeCSSResponse(data, res);
  });
};
//RETURN CSS FILE TO REQUESTER
const writeCSSResponse = (data, res) => {
  res.writeHead(200, {
    'Content-Length' : data.length,
    'Content-Type' : 'text/css'
  });
  res.end(data);
};

//READ FILE TO PREPARE 404 ERROR PAGE
const sendError = (res) => {
  fs.readFile(`public/404.html`, (err, data) => {
    return writeErrorResponse(data, res);
  });
};
//RETURN 404 ERROR PAGE BACK TO REQUESTER
const writeErrorResponse = (data, res) => {
  res.writeHead(404, {
    'Content-Length' : data.length,
    'Content-Type' : 'text/html'
  });
  res.end(data);
};

//CHECK IF FILE EXISTS BEFORE WRITING AND SENDING SUCCESS OR FAILURE TO A POST REQUEST
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

//WRITE THE ACTUAL FILE FOR THE POST REQUEST
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

//UPDATES INDEX PAGE WHEN NEW FILE IS POSTED
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

//CHECKS IF A FILE EXISTS- RETURNS BOOLEAN
const checkExistance = (path) => {
  return fs.existsSync(`public${path}`);
};
//CHECKS BODY OBJECT TO MAKE SURE IT HAS ALL THE NECESSARY PROPERTIES NEEDED TO CREATE FILE
const checkBodyObj = (bodyObj) => {
  return bodyObj.hasOwnProperty('elementName') && bodyObj.hasOwnProperty('elementSymbol') && bodyObj.hasOwnProperty('elementAtomicNumber') && bodyObj.hasOwnProperty('elementDescription');
};

//REWRITES EXISTING FILE WHEN A PUT REQUEST IS RECEIVED
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
//SENDS SUCCESS OR ERROR WHEN PUT REQUEST FILE IS ACTUALLY APPLIED
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

//DELETES ELEMENT FROM INDEX.HTML WHEN IT IS REMOVED FORM FILE SYSTEM THROUGH DELETE REQUEST
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