const https = require("https");
const http = require("http");

module.exports = {
  get: (path) => {
    let options = {
      host: 'localhost',
      //port: 443,
      path: '/v1/' + path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
  
    let req =  http.get(options, function(res) {
      // console.log('STATUS: ' + res.statusCode);
      // console.log('HEADERS: ' + JSON.stringify(res.headers));
    
      var bodyChunks = [];
      res.on('data', function(chunk) {
        bodyChunks.push(chunk);
      }).on('end', function() {
        var body = Buffer.concat(bodyChunks);
        var json = JSON.parse(body);
        console.log(json.nama);
      });
    });
    req.on('error', function(e) {
      console.log('ERROR: ' + e.message);
    });
  },
  post: (path, data, token) => {
    let postData = JSON.stringify(data);
    let options = {
      hostname: 'localhost',
      //port: 443,
      path: '/v1/' + path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': postData.length
      }
    };
    let req = http.request(options, (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      var bodyChunks = [];
      res.on('data', (d) => {
        process.stdout.write(d);
        bodyChunks.push(d);
      });
      res.on('end', () => {
        var body = Buffer.concat(bodyChunks);
        process.stdout.write(body);
        return JSON.parse(body);
      });
    });
    req.on('error', (e) => {
      console.error(e);
    });
    req.write(postData);
    req.end();
  }
};