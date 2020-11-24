// modules
const express = require("express");
const router = express.Router();

// controller
const boards = require("../../controllers/boards");

// middleware
const token = require("../../middlewares/token");

router.get("/boards", boards.filter);
router.post("/boards", token, boards.create);
router.post("/boards/:slug", boards.boardBySlug);
router.post("/boards/:slug/posts", boards.boardPosts);
router.delete("/boards/:slug", boards.deleteBoard);

module.exports = router;
