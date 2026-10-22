// modules
import express from "express";
const router = express.Router();

// controller
import * as me from "../../controllers/me";

// middleware
import { authRequired } from "../../middlewares/auth";

router.get("/users/profile", authRequired, me.getProfile);
router.patch("/users/profile", authRequired, me.updateProfile);

router.get("/users/permissions", authRequired, me.getUserPermissions);
router.get("/users/dashboard", authRequired, me.accessDashboard);

export default router;
