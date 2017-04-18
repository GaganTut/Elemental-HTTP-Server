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