// modules
const express = require('express');
const router = express.Router();

// controller
const vote = require('../../controllers/vote');

// middleware
const token = require('../../middlewares/token');

router.post('/vote/upvote', token.validate, vote.upvote)

module.exports = router
