// modules
const express = require('express');
const router = express.Router();

// requiring all routes
const auth = require('./auth')

router.use('/api/v1/', auth);

module.exports = router;