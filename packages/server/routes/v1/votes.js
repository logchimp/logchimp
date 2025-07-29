// modules
import express from "express";
const router = express.Router();

// controller
import * as votes from "../../controllers/votes";

// middleware
import * as middleware from "../../middlewares";

router.post("/votes", middleware.apiAuth, votes.add);
router.delete("/votes", middleware.apiAuth, votes.remove);

export default router;
