// modules
const express = require("express");
const router = express.Router();

// controller
const post = require("../../controllers/post");

// middleware
const token = require("../../middlewares/token");
const middleware = require("../../middlewares");
const validateUserAccess = require("../../middlewares/validateUserAccess");
const exists = require("../../middlewares/posts/exists");

router.post("/posts/get", post.filterPost);
router.get("/posts/:slug", post.postBySlug);

router.post("/posts", middleware.apiAuth, post.create);
router.patch("/posts/:postId", token, validateUserAccess, post.updatePost);

router.delete("/posts", middleware.apiAuth, exists, post.deleteById);

module.exports = router;
