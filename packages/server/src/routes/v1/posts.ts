// modules
import express from "express";
const router = express.Router();

// controller
import * as post from "../../controllers/post";

// middleware
import { authRequired } from "../../middlewares/auth";
import { postExists } from "../../middlewares/postExists";

router.post("/posts/get", authRequired, post.filterPost);
router.post("/posts/slug", postExists, post.postBySlug);

router.post("/posts", authRequired, post.create);
router.patch("/posts", authRequired, postExists, post.updatePost);

router.delete("/posts", authRequired, postExists, post.deleteById);

export default router;
