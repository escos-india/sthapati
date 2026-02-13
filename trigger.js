const http = require('http');

const options = {
  hostname: 'localhost',
  post: 9002,
  path: '/api/admin/trigger-notification',
  method: 'GET',
};

http.get('http://localhost:9002/api/admin/trigger-notification', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log(data);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
