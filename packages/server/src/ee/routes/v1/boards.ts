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
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

router.get<unknown, unknown, unknown, TFilterBoardRequestQuery>(
  "/boards",
  // @ts-expect-error
  withLicenseGuard(boards.filter, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.get<unknown, unknown, unknown, IGetBoardsRequestQuery>(
  "/boards/get",
  // @ts-expect-error
  withLicenseGuard(boards.get, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.get<IGetBoardByUrlRequestParams>(
  "/boards/:url",
  boardExists,
  // @ts-expect-error
  withLicenseGuard(boards.boardByUrl, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.get<ISearchBoardRequestParams>(
  "/boards/search/:name",
  // @ts-expect-error
  authRequired,
  // @ts-expect-error
  withLicenseGuard(boards.searchBoard, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);

router.post(
  "/boards/check-slug",
  authRequired,
  withLicenseGuard(boards.checkSlug, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.post(
  "/boards",
  authRequired,
  withLicenseGuard(boards.create, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.patch(
  "/boards",
  authRequired,
  // @ts-expect-error
  boardExists,
  withLicenseGuard(boards.updateBoard, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);

router.delete(
  "/boards",
  authRequired,
  // @ts-expect-error
  boardExists,
  withLicenseGuard(boards.deleteById, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);

// --- Start: Deprecated, will be removed in next major release ---
router.post(
  "/boards/check-name",
  authRequired,
  withLicenseGuard(boards.checkName, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
// -- End: Deprecated ---

export default router;
