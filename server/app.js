var express = require('express');
var path = require('path');
var compression = require('compression');

const PORT = parseInt(process.argv[2], 10) || 3000;

var app = express();

// Compress response bodies for all requests.
app.use(compression());

// Serve static files at ../public to /.
app.use(express.static(path.join(__dirname, '../public')));

// Listen for connections.
app.listen(PORT, function() {
    console.log(`Listening on port ${PORT}.`);
});