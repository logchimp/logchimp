// modules
const express = require("express");
const router = express.Router();

// controller
const boards = require("../../controllers/boards");

// middleware
const middleware = require("../../middlewares");
const exists = require("../../middlewares/boardExists");

router.get("/boards", boards.filter);
router.post("/boards/:slug", boards.boardBySlug);

router.post("/boards", middleware.apiAuth, boards.create);
router.delete("/boards", middleware.apiAuth, exists, boards.deleteById);

module.exports = router;
