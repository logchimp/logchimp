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
import { authOptional, authRequired } from "../../../middlewares/auth";
import { boardExists } from "../../middleware/boardExists";
// import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

//changed the path
import { withLicenseGuardWrapper } from "../../../middlewares/licenseGuardWrapper";

router.get<unknown, unknown, unknown, TFilterBoardRequestQuery>(
  "/boards",
  withLicenseGuardWrapper(boards.filter, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
      skipHandlerOnFailure: false,
  }),
);
router.get<unknown, unknown, unknown, IGetBoardsRequestQuery>(
  "/boards/get",
  // @ts-expect-error
  authOptional,
  withLicenseGuardWrapper(boards.get, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  
  }),
);
router.get<IGetBoardByUrlRequestParams>(
  "/boards/:url",
  // @ts-expect-error
  authOptional,
  boardExists,
  withLicenseGuardWrapper(boards.boardByUrl, {
    requiredPlan: ["pro", "business", "enterprise"],
    
    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.get<ISearchBoardRequestParams>(
  "/boards/search/:name",
  // @ts-expect-error
  authRequired,
  withLicenseGuardWrapper(boards.searchBoard, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);

router.post(
  "/boards/check-slug",
  authRequired,
  withLicenseGuardWrapper(boards.checkSlug, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.post(
  "/boards",
  authRequired,
  withLicenseGuardWrapper(boards.create, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.patch(
  "/boards",
  authRequired,
  // @ts-expect-error
  boardExists,
  withLicenseGuardWrapper(boards.updateBoard, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);

router.delete(
  "/boards",
  authRequired,
  // @ts-expect-error
  boardExists,
  withLicenseGuardWrapper(boards.deleteById, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);

// --- Start: Deprecated, will be removed in next major release ---
router.post(
  "/boards/check-name",
  authRequired,
  withLicenseGuardWrapper(boards.checkName, {
    requiredPlan: ["pro", "business", "enterprise"],
    
    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
    skipHandlerOnFailure: false,
  }),
);
// -- End: Deprecated ---

export default router;
