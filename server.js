/*jshint esversion: 6*/
const http = require('http');

const server = http.createServer((req, res) => {

});

server.listen(8888, () => {
  console.log("Server has started!");
});