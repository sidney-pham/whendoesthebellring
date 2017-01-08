var express = require('express'),
    session = require('express-session'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    compression = require('compression'),
    auth = require('./auth'),
    app = express();

const PORT = parseInt(process.argv[2], 10) || 3000;

// Compress response bodies for all requests.
app.use(compression());

// Enable reading of cookies.
app.use(cookieParser());

// Get config file and call auth function with appropriate arguments.
var config = require('./config').config;
auth(app, config.clientId, config.clientSecret, config.host + ":" + PORT);

// Serve static files at ../public to /.
app.use(express.static(path.join(__dirname, '../public')));

// Listen for connections.
app.listen(PORT, function() {
    console.log(`Listening on port ${PORT}.`);
});