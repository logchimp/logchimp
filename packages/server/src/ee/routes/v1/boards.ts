import express from "express";
import type {
  IGetBoardByUrlRequestParams,
  IGetBoardsRequestQuery,
  ISearchBoardRequestParams,
  TFilterBoardRequestQuery,
} from "@logchimp/types";
const router = express.Router();

// controller
import * as boards from "../../controllers/v1/boards";

// middleware
import * as middleware from "../../../middlewares";
import { boardExists } from "../../middleware/boardExists";

router.get<unknown, unknown, unknown, TFilterBoardRequestQuery>(
  "/boards",
  boards.filter,
);
router.get<unknown, unknown, unknown, IGetBoardsRequestQuery>(
  "/boards/get",
  boards.get,
);
router.get<IGetBoardByUrlRequestParams>(
  "/boards/:url",
  boardExists,
  boards.boardByUrl,
);
router.get<ISearchBoardRequestParams>(
  "/boards/search/:name",
  // @ts-expect-error
  middleware.apiAuth,
  boards.searchBoard,
);

router.post("/boards/check-name", middleware.apiAuth, boards.checkName);
router.post("/boards", middleware.apiAuth, boards.create);
router.patch("/boards", middleware.apiAuth, boardExists, boards.updateBoard);

router.delete("/boards", middleware.apiAuth, boardExists, boards.deleteById);

export default router;
