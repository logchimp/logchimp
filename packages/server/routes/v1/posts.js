// modules
const express = require("express");
const router = express.Router();

// controller
const post = require("../../controllers/post");

// middleware
const middleware = require("../../middlewares");
const exists = require("../../middlewares/postExists");

router.post("/posts/get", post.filterPost);
router.post("/posts/slug", exists, post.postBySlug);

router.post("/posts", middleware.apiAuth, post.create);
router.patch("/posts", middleware.apiAuth, exists, post.updatePost);

router.delete("/posts", middleware.apiAuth, exists, post.deleteById);

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

module.exports = router;
