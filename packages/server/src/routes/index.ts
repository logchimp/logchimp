// modules
import express from "express";
const router = express.Router();

// v1 APIs
import v1 from "./v1";

router.get("/api", (_, res) => {
  res.send("👍");
});

// v1 APIs
router.use(v1);

export default router;
