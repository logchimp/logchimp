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
import { withLicenseGuard } from "../../middleware/licenseGuard";

router.get<unknown, unknown, unknown, TFilterBoardRequestQuery>(
  "/boards",
  withLicenseGuard(boards.filter, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.get<unknown, unknown, unknown, IGetBoardsRequestQuery>(
  "/boards/get",
  withLicenseGuard(boards.get, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.get<IGetBoardByUrlRequestParams>(
  "/boards/:url",
  boardExists,
  withLicenseGuard(boards.boardByUrl, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.get<ISearchBoardRequestParams>(
  "/boards/search/:name",
  authRequired,
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
  boardExists,
  withLicenseGuard(boards.updateBoard, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);

router.delete(
  "/boards",
  authRequired,
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
