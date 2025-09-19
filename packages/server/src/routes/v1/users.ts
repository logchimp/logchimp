// modules
import express from "express";
const router = express.Router();

// controller
import * as users from "../../controllers/users";

// middleware
import { authRequired } from "../../middlewares/auth";

router.get("/users", authRequired, users.filter);
router.get("/users/profile", authRequired, users.getProfile);
router.patch("/users/profile", authRequired, users.updateProfile);

router.get("/users/permissions", authRequired, users.getUserPermissions);
router.get("/users/dashboard", authRequired, users.accessDashboard);

export default router;
