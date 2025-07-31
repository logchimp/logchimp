// modules
import express from "express";
const router = express.Router();
import rateLimit from "express-rate-limit";

// controller
import { serveImages } from "../controllers/serveImages";

// v1 APIs
import v1 from "./v1";

// server images
/**
 * limit rate limit for 15 minutes
 * each IP to 100 requests per windowMs
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
router.use("/content/images", limiter, serveImages);

router.get("/api", (_, res) => {
  res.send("👍");
});

// v1 APIs
router.use(v1);

export default router;
