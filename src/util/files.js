// Required packages
const fs = require('fs');

// Util functions
const logger = require('./logger.js');

// Delete file function
module.exports.deleteFile = (resolvedPath) => {
  // Delete the file
  fs.unlink(resolvedPath, (err) => {
    // If there is an error, log the error
    if (err) logger.error(err);
  });
};