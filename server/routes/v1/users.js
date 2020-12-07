// modules
const express = require("express");
const router = express.Router();

// controller
const users = require("../../controllers/users");

// middleware
const middleware = require("../../middlewares");

router.get("/users", users.filter);
router.patch("/user", users.updateUser);
router.get("/users/profile", middleware.apiAuth, users.getProfile);
router.get("/user/accessDashboard/:userId", users.accessDashboard);

module.exports = router;
