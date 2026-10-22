// modules
import express from "express";
const router = express.Router();

// controller
import * as me from "../../controllers/me";

// middleware
import { authRequired } from "../../middlewares/auth";

// Authenticated user routes available under `/me` endpoint.

router.get("/me/profile", authRequired, me.getProfile);
router.patch("/me/profile", authRequired, me.updateProfile);
router.get("/me/permissions", authRequired, me.getUserPermissions);
router.get("/me/dashboard", authRequired, me.accessDashboard);

// It is still undecided if we will be officially marking the `/users` endpoint as deprecated.

router.get("/users/profile", authRequired, me.getProfile);
router.patch("/users/profile", authRequired, me.updateProfile);
router.get("/users/permissions", authRequired, me.getUserPermissions);
router.get("/users/dashboard", authRequired, me.accessDashboard);

export default router;
