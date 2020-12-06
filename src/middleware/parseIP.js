// Get config 
const config = require('../../config.json');

// Define util functions
const logger = require('../util/logger.js');
const ip = require('../util/ip.js');

// Define router
const { Router, json } = require('express');
const router = new Router();

// Middleware creation
router.use(async (req, res, next) => {
  req.parsedIP = await ip.parseIP(req.ip);
  logger.debug('Parsed IP', req.parsedIP);
  next();
});

// Export
module.exports = router;