// This is a simple static server for dev
// Just start it to you can test your libs
// in a browser using HTTP protocol on port 3000

var static = require('node-static');

var fileServer = new static.Server('./');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response, function (e){
            if (e && (e.status === 404)) { // If the file wasn't found
                fileServer.serveFile('/index.html', 200, {}, request, response);
            }
        });
    }).resume();
}).listen(3000, function (){
    console.log('Open development server at port 3000');
    console.log('Files not found will load /index.html');
    console.log('http://localhost:3000');
});
