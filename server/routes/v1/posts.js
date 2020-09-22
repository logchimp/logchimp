// modules
const express = require("express");
const router = express.Router();

// controller
const post = require("../../controllers/post");

// middleware
const token = require("../../middlewares/token");
const authorizeUser = require("../../middlewares/authorizeUser");

router.post("/posts", token, post.create);
router.get("/posts", post.filterPost);
router.delete("/post/delete", token, post.deleteById);
router.get("/posts/:slug", post.postBySlug);
router.patch("/posts/:postId", token, authorizeUser.author, post.updatePost);

module.exports = router;
