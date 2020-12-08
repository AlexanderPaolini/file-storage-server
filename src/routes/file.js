// Get config 
const config = require('../../config.json');

// Define util functions
const logger = require('../util/logger.js');

// Database Models
const fileModel = require('../models/file.js');

// Packages required
const fetch = require('node-fetch');

// Define router
const { Router } = require('express');
const router = new Router();

// Route creation
router.get('/:name', async (req, res) => {
  // Get file data from DB
  let fileData;
  try {
    fileData = await fileModel.findOne({ name: req.params.name });
    logger.debug('Retrieved', req.params.name, 'from the DB');
  } catch (err) {
    // If error occurs when retreiving from DB, return 500 (Internal Server Error)
    logger.error('Retrieving', req.params.name, 'from the DB failed');
    logger.error(err);
    res.status(500).send('Internal Server Error');
    return;
  };
  // Check to make sure it exists, if not return 404 (Not Found)
  if (!fileData) {
    logger.debug('User', `${req.parsedIP}`, 'requested file', req.params.name, 'which does not exist');
    res.status(404).send('File not found');
    return;
  }
  // Node is the place where the file was stored
  let node = config.storageNodes.find(e => e.id == fileData.nodeID);
  // If there is no storage node, return 404 (Not Found)
  if (!node) {
    logger.warn('Node not found for file', req.params.name);
    res.status(404).send('File not found');
    return;
  }
  // Options for fetching
  let fetchOptions = {
    method: 'get',
    headers: {
      token: node.token,
    },
  };
  let buffer;
  try {
    let fetchResponse = await fetch(`${node.url}/get/${fileData.id}`, fetchOptions);
    logger.debug('GET request to node', node.id);
    // Get the buffer of the file
    buffer = await fetchResponse.buffer();
  } catch (err) {
    // If an error occurs while requesting, log it and return 500 (Internal Server Error)
    logger.error('Error occured when requesting from node', node.id);
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "An unknown error has occured.",
      fix: "Try again later."
    });
    files.deleteFile(req.files.file.tempFilePath);
    return;
  }
  // Send the buffer
  res.contentType(fileData.mimetype);
  res.end(buffer, 'binary');
  logger.log('Sent file', fileData.name, 'to', req.parsedIP);
  return;
});

// Export
module.exports = router;