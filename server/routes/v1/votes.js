// modules
const express = require("express");
const router = express.Router();

// controller
const votes = require("../../controllers/votes");

// middleware
const token = require("../../middlewares/token");

router.post("/votes", token.validate, votes.add);

module.exports = router;
