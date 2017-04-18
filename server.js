/*jshint esversion: 6*/
const http = require('http');
const fs = require('fs');
const methodHandler = require('./methodHandler.js');

const server = http.createServer(methodHandler).listen(8888);

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