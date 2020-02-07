// modules
const express = require('express');
const router = express.Router();

// controller
const vote = require('../../controllers/vote');

// middleware
const token = require('../../middlewares/token');

router.post('/vote/create', token.validate, vote.create)

module.exports = router
