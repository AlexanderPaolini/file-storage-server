// Configuration
const config = require('../config.json');
const port = config.port || 1234;

// ExpressJS
const express = require('express');

// Connect to the DB
const mongoose = require('mongoose');
mongoose.connect(config.mongo.connectURI, config.mongo.connectOptions);

// Create the server
const app = express();

// Util
const logger = require('./util/logger.js');

// Middleware
const authentication = require('./middleware/authentication.js');
const parseIP = require('./middleware/parseIP.js');

// Routers
const uploadRoute = require('./routes/api/upload.js');
const fileRoute = require('./routes/file.js');
const deleteRoute = require('./routes/delete.js');

// Routes
app.use('*', parseIP);
app.use('/api/upload', authentication, uploadRoute);
app.use(deleteRoute);
app.use(fileRoute);


// Start Server
app.listen(port, () => { logger.log("File Storage Server Started"); });

// process.on('uncaughtException', (err) => { logger.error(err); });
