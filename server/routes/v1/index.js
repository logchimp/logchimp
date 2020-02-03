// modules
const express = require('express');
const router = express.Router();

// requiring all routes
const auth = require('./auth')
const posts = require('./posts');

router.use('/api/v1', auth);
router.use('/api/v1', posts);

module.exports = router;
