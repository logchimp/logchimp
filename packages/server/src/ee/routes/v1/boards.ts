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
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.get<unknown, unknown, unknown, IGetBoardsRequestQuery>(
  "/boards/get",
  // @ts-expect-error
  withLicenseGuard(boards.get, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.get<IGetBoardByUrlRequestParams>(
  "/boards/:url",
  boardExists,
  // @ts-expect-error
  withLicenseGuard(boards.boardByUrl, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.get<ISearchBoardRequestParams>(
  "/boards/search/:name",
  // @ts-expect-error
  authRequired,
  // @ts-expect-error
  withLicenseGuard(boards.searchBoard, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);

router.post(
  "/boards/check-slug",
  authRequired,
  withLicenseGuard(boards.checkSlug, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.post(
  "/boards",
  authRequired,
  withLicenseGuard(boards.create, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.patch(
  "/boards",
  authRequired,
  // @ts-expect-error
  boardExists,
  withLicenseGuard(boards.updateBoard, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);

router.delete(
  "/boards",
  authRequired,
  // @ts-expect-error
  boardExists,
  withLicenseGuard(boards.deleteById, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);

// --- Start: Deprecated, will be removed in next major release ---
router.post(
  "/boards/check-name",
  authRequired,
  withLicenseGuard(boards.checkName, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
// -- End: Deprecated ---

export default router;
