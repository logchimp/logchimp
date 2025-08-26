// modules
import express from "express";
const router = express.Router();

// controller
import * as post from "../../../ee/controllers/v1/posts";

// middleware
import * as middleware from "../../../middlewares";

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
