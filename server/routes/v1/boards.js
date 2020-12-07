// modules
const express = require("express");
const router = express.Router();

// controller
const boards = require("../../controllers/boards");

// middleware
const middleware = require("../../middlewares");

router.get("/boards", boards.filter);
router.post("/boards/:slug", boards.boardBySlug);
router.delete("/boards/:slug", boards.deleteBoard);

router.post("/boards", middleware.apiAuth, boards.create);

module.exports = router;
