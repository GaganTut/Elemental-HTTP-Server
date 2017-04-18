/*jshint esversion: 6*/
const getMeth = require('get.js');
const postMeth = require('post.js');
const putMeth = require('put.js');
const deleteMeth = require('delete.js');
const authenticate = require('authenticate.js');

module.exports = (req, res) => {
  switch(req.method) {
    case 'GET' :
      getMeth(req, res);
      break;

    case 'POST' :
      if (authenticate(req)) {
        req.on('data', (data) => {
          postMeth(req, res, data);
        });
      }
      break;

    case 'PUT' :
      if (authenticate(req)) {
        req.on('data', (data) => {
          putMeth(req, res, data);
        });
      }
      break;

    case 'DELETE' :
      if (authenticate(req)) {
        deleteMeth(req, res);
      }
      break;
  }
};