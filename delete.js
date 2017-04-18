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