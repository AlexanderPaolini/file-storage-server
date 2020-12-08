// Get config 
const config = require('../../../config.json');

// Define util functions
const logger = require('../../util/logger.js');
const random = require('../../util/random.js');
const files = require('../../util/files');

// Database Models
const fileModel = require('../../models/file.js');

// Packages required
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

// Define router
const { Router } = require('express');
const router = new Router();

// Middleware
const fileUpload = require('express-fileupload');
router.use(fileUpload({
  safeFileNames: true,
  preserveExtension: true,
  useTempFiles: true,
  tempFileDir: './tmp',
}));

// Route creation
router.post('/', async (req, res) => {
  // Check if file, return 400 (Bad Request) if none
  if (!req.files?.file) {
    logger.debug('User from', req.parsedIP, 'posted /api/upload without a file');
    req.status(400).json({
      success: false,
      message: "No file included.",
      fix: "Include a file with the name \"file\""
    });
    return;
  }
  // Create FormData and append the file as "file"
  let formData = new FormData();
  formData.append('file', fs.createReadStream(req.files.file.tempFilePath));
  // Get a random node from config
  let nodeNum = random.randomNumber(0, config.storageNodes.length - 1);
  let node = config.storageNodes[nodeNum];
  // If there is no node return 500 (Internal Server Error), warn console, and delete the file
  if (!node) {
    logger.warn('No node found for upload.');
    req.status(500).json({
      success: false,
      message: "An unknown error has occured.",
      fix: "Try again later."
    });
    files.deleteFile(req.files.file.tempFilePath);
    return;
  }
  // Define the options for the fetch
  let fetchOptions = {
    method: 'post',
    headers: {
      token: node.token,
    },
    body: formData,
  };
  let response;
  try {
    let fetchResponse = await fetch(`${node.url}/save`, fetchOptions);
    logger.debug('POST request to node', node.id);
    // Get the json of the response
    response = await fetchResponse.json();
  } catch (err) {
    // If there is an error in the request, return 500 (Internal Server Error) and delete the file
    logger.error('Error occured when posting to node', node.id);
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "An unknown error has occured.",
      fix: "Try again later."
    });
    files.deleteFile(req.files.file.tempFilePath);
    return;
  };
  // If success is false, return 500 (Internal Server Error) and delete the file
  if (!response.success) {
    logger.warn('POST request to node', node.id, 'failed');
    logger.warn(response.message);
    res.status(500).json({
      success: false,
      message: "An unknown error has occured.",
      fix: "Try again later."
    });
    files.deleteFile(req.files.file.tempFilePath);
    return;
  }
  // Define the object to be saved in the DB
  let fileObj = {
    name: random.generateRandomString(16),
    deletionKey: random.generateRandomString(32),
    id: response.id,
    nodeID: node.id,
    mimetype: req.files.file.mimetype,
    user: req.user.name,
    date: new Date().toLocaleDateString()
  };
  // Save the object in the DB
  try {
    await fileModel.create(fileObj);
    logger.debug('Saved file', `${fileObj.name}`, 'in the DB');
  } catch (err) {
    logger.error('Saving', `${fileObj.name}`, 'to DB failed');
    logger.error(err);
    res.status(500).json({
      success: false,
      message: "An unknown error has occured.",
      fix: "Try again later."
    });
    files.deleteFile(req.files.file.tempFilePath);
    return;
  }
  // Attempt to delete the file
  files.deleteFile(req.files.file.tempFilePath);
  // Return with the URL of the file
  logger.log('Saved file', `${fileObj.name}`, 'from', req.parsedIP);
  let mainURL = (config.secure ? 'https://' : 'http://') + config.domain;
  res.status(200).json({
    success: true,
    url: mainURL + '/' + fileObj.name,
    delete_url: mainURL + '/delete/' + fileObj.deletionKey
  });
  return;
});

// Export
module.exports = router;