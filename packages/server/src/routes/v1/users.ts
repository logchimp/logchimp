// modules
import express from "express";
const router = express.Router();

// controller
import * as users from "../../controllers/users";

// middleware
import { authRequired } from "../../middlewares/auth";

router.get("/users", authRequired, users.filter);

export default router;
