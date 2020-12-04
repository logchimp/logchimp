// modules
const express = require("express");
const router = express.Router();

// controller
const post = require("../../controllers/post");

// middleware
const token = require("../../middlewares/token");
const validateUserAccess = require("../../middlewares/validateUserAccess");

router.post("/posts", token, post.create);
router.delete("/post/delete", token, post.deleteById);
router.post("/posts/get", post.filterPost);
router.get("/posts/:slug", post.postBySlug);
router.patch("/posts/:postId", token, validateUserAccess, post.updatePost);

module.exports = router;
