// modules
import express from "express";
const router = express.Router();

// controller
import * as users from "../../controllers/users";

// middleware
import * as middleware from "../../middlewares";

router.get("/users", users.filter);
router.get("/users/profile", middleware.apiAuth, users.getProfile);
router.patch("/users/profile", middleware.apiAuth, users.updateProfile);

router.get("/users/permissions", middleware.apiAuth, users.getUserPermissions);
router.get("/users/dashboard", middleware.apiAuth, users.accessDashboard);

module.exports = router;
