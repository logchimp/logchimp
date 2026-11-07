import express from "express";
import type { operations } from "@logchimp/api-ts-types";

// controller
import * as boards from "../../controllers/v1/boards";

// middleware
import { authOptional, authRequired } from "../../../middlewares/auth";
import { boardExists } from "../../middleware/boardExists";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

const router = express.Router();

router.get<
  unknown,
  unknown,
  unknown,
  operations["filterPublicBoards"]["parameters"]["query"]
>(
  "/boards",
  withLicenseGuard(boards.filter, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.get<
  unknown,
  unknown,
  unknown,
  operations["filterPublicBoards"]["parameters"]["query"]
>(
  "/boards/get",
  authOptional,
  withLicenseGuard(boards.get, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.get<operations["getBoardByUrl"]["parameters"]["path"]>(
  "/boards/:url",
  authOptional,
  boardExists,
  withLicenseGuard(boards.boardByUrl, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.get<operations["searchBoardByName"]["parameters"]["path"]>(
  "/boards/search/:name",
  authRequired,
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
  boardExists,
  withLicenseGuard(boards.updateBoard, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);

router.delete(
  "/boards",
  authRequired,
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
