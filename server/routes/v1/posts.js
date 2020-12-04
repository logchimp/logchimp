// modules
const express = require("express");
const router = express.Router();

// controller
const post = require("../../controllers/post");

// middleware
const token = require("../../middlewares/token");
const middleware = require("../../middlewares");
const validateUserAccess = require("../../middlewares/validateUserAccess");

router.get("/posts", post.filterPost);
router.delete("/post/delete", token, post.deleteById);
router.get("/posts/:slug", post.postBySlug);

router.post("/posts", middleware.apiAuth, post.create);
router.patch("/posts/:postId", token, validateUserAccess, post.updatePost);

module.exports = router;
