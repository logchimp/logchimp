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

// TODO: create permission for user:read, user:update, user:create, user:delete
// router.get("/users/get", middleware.apiAuth, users.accessDashboard);
// router.get("/users/:user_id/get", middleware.apiAuth, users.getUserInfo);
// router.patch(
// 	"/users/:user_id/update",
// 	middleware.apiAuth,
// 	users.updateUserInfo
// );

module.exports = router;
