// modules
import express from "express";
const router = express.Router();

// controller
import * as boards from "../../controllers/v1/boards";

// middleware
import * as middleware from "../../../middlewares";
import exists from "../../middleware/boardExists";

router.get("/boards", boards.filter);
router.get("/boards/get", boards.get);
router.get("/boards/:url", exists, boards.boardByUrl);
router.get("/boards/search/:name", middleware.apiAuth, boards.searchBoard);

router.post("/boards/check-name", middleware.apiAuth, boards.checkName);
router.post("/boards", middleware.apiAuth, boards.create);
router.patch("/boards", middleware.apiAuth, exists, boards.updateBoard);

router.delete("/boards", middleware.apiAuth, exists, boards.deleteById);

module.exports = router;
