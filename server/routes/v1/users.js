// modules
const express = require("express");
const router = express.Router();

// controller
const users = require("../../controllers/users");

// middleware
const middleware = require("../../middlewares");

router.get("/users", users.filter);
router.get("/users/profile", middleware.apiAuth, users.getProfile);
router.patch("/users/profile", middleware.apiAuth, users.updateProfile);

router.get("/users/permissions", middleware.apiAuth, users.getUserPermissions);
router.get("/users/dashboard", middleware.apiAuth, users.accessDashboard);

module.exports = router;
