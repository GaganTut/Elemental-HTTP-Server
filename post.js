/*jshint esversion: 6*/
const helpers = require('helpers.js');
const createFile = require('createElementFile.js');

module.exports = (req, res, body) => {
  const bodyData = body.toString().split('&');
  const bodyObj = {};

  for (let i = 0; i < bodyData.length; i++) {
    bodyObj[bodyData[i].split('=')[0]] = bodyData[i].split('=')[1].split("+").join(' ');
  }

  if (checkBodyObj(bodyObj) && req.url === '/elements')
    helpers.createFile(bodyObj, res);
  else
    helpers.sendError(res);
};