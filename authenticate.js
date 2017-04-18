/*jshint esversion: 6*/
module.exports = (req, res) => {
  let decodedAttempt = new Buffer(req.headers.authorization.slice(6), 'base64').toString();

  if(decodedAttempt === 'basic:authentication') {
    return true;
  } else {
    const wrongAuthResponse = (res) => {
      res.writeHead(401, {
        "WWW-Authenticate": "Basic realm=\"Secure Area\""
      });
      res.end('<html><body>Invalid Authentication Credentials</body></html>');
    };
  }
};