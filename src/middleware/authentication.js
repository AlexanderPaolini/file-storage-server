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
  // Check for token and user, return if no token or user
  let token = req.headers.token;
  let user = token ? config.users.find(e => e.token == token) : undefined;
  if (!token || !user) {
    logger.warn('Failed authentication from', req.parsedIP);
    res.status(401).json({
      success: false,
      message: "No token header provided",
      fix: "Include a valid token header"
    });
    return;
  }
  // Make user accessable everywhere
  req.user = user;
  // Continue
  next();
});

// Export
module.exports = router;