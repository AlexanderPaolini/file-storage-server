// Get config 
const config = require('../../config.json');

// Define util functions
const logger = require('../util/logger.js');

// Return Messages
const messages = require('../util/messages.json');

// Database Models
const fileModel = require('../models/file.js');

// Packages required
const fetch = require('node-fetch');

// Define router
const { Router } = require('express');
const router = new Router();

// Route creation
router.get('/delete/:key', async (req, res) => {
  // Get file data from DB
  let fileData;
  try {
    fileData = await fileModel.findOne({ deletionKey: req.params.key });
    logger.debug('Retrieved', `"${req.params.key}"`, 'from the DB');
  } catch (err) {
    // If error occurs when retreiving from DB, return 500 (Internal Server Error)
    logger.error('Retrieving', `"${req.params.key}"`, 'from DB failed');
    logger.error(err);
    res.status(500).send('Internal Server Error');
    return;
  }
  // Check to make sure it exists, if not return 404 (Not Found)
  if (!fileData) {
    logger.debug('User', `${req.parsedIP}`, 'requested the deletion of a file which does not exist');
    res.status(404).send('File not found');
    return;
  }
  // Node is the place where the file was stored
  let node = config.storageNodes.find(e => e.id == fileData.nodeID);
  // If there is no storage node, return 404 (Not Found)
  if (!node) {
    logger.warn('Node not found for file', `"${req.params.key}"`);
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
  let response;
  try {
    let fetchResponse = await fetch(`${node.url}/delete/${fileData.id}`, fetchOptions);
    logger.debug('GET request to node', node.id);
    // Get the json  of the request
    response = await fetchResponse.json();
  } catch (err) {
    // If an error occurs while requesting, log it and return 500 (Internal Server Error)
    logger.error('Error occured when requesting from node', node.id);
    logger.error(err);
    res.status(500).send(messages.UNKNOWN_ERROR);
    return;
  }
  // If the response success returns false, log response and return 500 (Internal Server Error)
  if (!response.success) {
    logger.warn('Error deleting file from node', node.id);
    logger.warn(response.message);
    res.status(500).send(messages.UNKNOWN_ERROR);
    return;
  }
  try {
    // Delete the file from the DB
    await fileModel.deleteOne({ deletionKey: req.params.key });
    logger.debug('Deleted', fileData.id, 'from the DB');
  } catch (err) {
    logger.error('Error when deleting', fileData.id, 'from the DB');
    logger.error(err);
    res.status(500).send(messages.UNKNOWN_ERROR);
    return;
  }
  res.status(200).send('File successfully deleted.');
  return;
});

// Export
module.exports = router;