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

// post activity
router.get("/posts/:post_id/activity", post.activity.get);

// post comment
router.post(
  "/posts/:post_id/comments",
  middleware.apiAuth,
  post.comments.create,
);
router.put(
  "/posts/:post_id/comments/:comment_id",
  middleware.apiAuth,
  post.comments.update,
);
router.delete(
  "/posts/:post_id/comments/:comment_id",
  middleware.apiAuth,
  post.comments.destroy,
);

export default router;
