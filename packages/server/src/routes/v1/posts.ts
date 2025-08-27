// modules
import express from "express";
const router = express.Router();

// controller
import * as post from "../../controllers/post";

// middleware
import * as middleware from "../../middlewares";
import { postExists } from "../../middlewares/postExists";

router.post("/posts/get", post.filterPost);
router.post("/posts/slug", postExists, post.postBySlug);

router.post("/posts", middleware.apiAuth, post.create);
router.patch("/posts", middleware.apiAuth, postExists, post.updatePost);

router.delete("/posts", middleware.apiAuth, postExists, post.deleteById);

export default router;
