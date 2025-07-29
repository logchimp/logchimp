// modules
import express from "express";
const router = express.Router();

// controller
import * as boards from "../../controllers/v1/boards";

// middleware
import * as middleware from "../../../middlewares";
import { boardExists } from "../../middleware/boardExists";

router.get("/boards", boards.filter);
router.get("/boards/get", boards.get);
router.get("/boards/:url", boardExists, boards.boardByUrl);
router.get("/boards/search/:name", middleware.apiAuth, boards.searchBoard);

router.post("/boards/check-name", middleware.apiAuth, boards.checkName);
router.post("/boards", middleware.apiAuth, boards.create);
router.patch("/boards", middleware.apiAuth, boardExists, boards.updateBoard);

router.delete("/boards", middleware.apiAuth, boardExists, boards.deleteById);

export default router;
