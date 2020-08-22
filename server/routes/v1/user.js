// modules
const express = require("express");
const router = express.Router();

// controller
const user = require("../../controllers/user");

router.get("/user/:userId", user.userById);

module.exports = router;
