// modules
const express = require("express");
const router = express.Router();

// controller
const boards = require("../../controllers/boards");

// middleware
const middleware = require("../../middlewares");
const exists = require("../../middlewares/boardExists");

router.get("/boards", boards.filter);
router.get("/boards/get", boards.get);
router.get("/boards/:url", exists, boards.boardByUrl);
router.get("/boards/search/:name", middleware.apiAuth, boards.searchBoard);

router.post("/boards/check-name", middleware.apiAuth, boards.checkName);
router.post("/boards", middleware.apiAuth, boards.create);
router.patch("/boards", middleware.apiAuth, exists, boards.updateBoard);

router.delete("/boards", middleware.apiAuth, exists, boards.deleteById);

module.exports = router;
