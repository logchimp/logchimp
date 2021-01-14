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

module.exports = router;
