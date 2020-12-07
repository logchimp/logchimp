// modules
const express = require("express");
const router = express.Router();

// controller
const votes = require("../../controllers/votes");

// middleware
const middleware = require("../../middlewares");

router.post("/votes", middleware.apiAuth, votes.add);
router.delete("/votes", middleware.apiAuth, votes.remove);

module.exports = router;
