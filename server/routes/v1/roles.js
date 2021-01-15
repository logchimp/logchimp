// modules
const express = require("express");
const router = express.Router();

// controller
const roles = require("../../controllers/roles");

// middleware
const middleware = require("../../middlewares");

router.post("/roles", middleware.apiAuth, roles.create);

module.exports = router;
