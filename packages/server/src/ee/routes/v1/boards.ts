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
import { licenseGuard } from "../../middleware/licenseGuard";

router.get<unknown, unknown, unknown, TFilterBoardRequestQuery>(
  "/boards",
  // @ts-expect-error
  licenseGuard,
  boards.filter,
);
router.get<unknown, unknown, unknown, IGetBoardsRequestQuery>(
  "/boards/get",
  // @ts-expect-error
  licenseGuard,
  boards.get,
);
router.get<IGetBoardByUrlRequestParams>(
  "/boards/:url",
  // @ts-expect-error
  licenseGuard,
  boardExists,
  boards.boardByUrl,
);
router.get<ISearchBoardRequestParams>(
  "/boards/search/:name",
  // @ts-expect-error
  licenseGuard,
  authRequired,
  boards.searchBoard,
);

router.post("/boards/check-slug", licenseGuard, authRequired, boards.checkSlug);
router.post("/boards", licenseGuard, authRequired, boards.create);
router.patch(
  "/boards",
  licenseGuard,
  authRequired,
  boardExists,
  boards.updateBoard,
);

router.delete(
  "/boards",
  licenseGuard,
  authRequired,
  boardExists,
  boards.deleteById,
);

// --- Start: Deprecated, will be removed in next major release ---
router.post("/boards/check-name", licenseGuard, authRequired, boards.checkName);
// -- End: Deprecated ---

export default router;
