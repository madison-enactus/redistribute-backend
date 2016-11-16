var http = require('http');
var mongoose = require('mongoose');
var config = require('./config');

// Initialize database connection - throws if database connection can't be
// established
var options = {
    server: { socketOptions:
                { keepAlive: 300000, connectTimeoutMS: 30000 }
    },
    replset: { socketOptions:
        { keepAlive: 300000, connectTimeoutMS : 30000 }
    }
};

mongoose.connect(config.mongoUrl);
var conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function() {
    // Wait for the database connection to establish, then
    // start the app.
    console.log('Connected to mLab database');

    // Create Express web app
    var app = require('./webapp');

    // Create an HTTP server and listen on the configured port
    var server = http.createServer(app);
    server.listen(config.port, function() {
        console.log('Express server listening on *:' + config.port);
    });
});

