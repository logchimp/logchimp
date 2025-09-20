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
import { authRequired } from "../../../middlewares/auth";
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
  authRequired,
  boards.searchBoard,
);

router.post("/boards/check-slug", authRequired, boards.checkSlug);
router.post("/boards", authRequired, boards.create);
router.patch("/boards", authRequired, boardExists, boards.updateBoard);

router.delete("/boards", authRequired, boardExists, boards.deleteById);

export default router;
