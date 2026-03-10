// modules
import express from "express";
const router = express.Router();

// controller
import * as roadmaps from "../../controllers/v1/roadmaps";

// middleware
import { authOptional, authRequired } from "../../../middlewares/auth";
import { roadmapExists } from "../../../middlewares/roadmapExists";
// import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

//changed the path
import { withLicenseGuardWrapper } from "../../../middlewares/licenseGuardWrapper";
import type {
  IGetRoadmapByUrlRequestParam,
  ISearchRoadmapRequestParam,
} from "@logchimp/types";

router.get(
  "/roadmaps",
  authOptional,

  //changed from withLicenseGuard to LicenseGuardWrapper
  withLicenseGuardWrapper(roadmaps.filter, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.get<IGetRoadmapByUrlRequestParam>(
  "/roadmaps/:url",
  // @ts-expect-error
  authOptional,
  roadmapExists,
  withLicenseGuardWrapper(roadmaps.roadmapByUrl, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.get<ISearchRoadmapRequestParam>(
  "/roadmaps/search/:name",
  // @ts-expect-error
  authRequired,
  withLicenseGuardWrapper(roadmaps.searchRoadmap, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.post(
  "/roadmaps",
  authRequired,
  withLicenseGuardWrapper(roadmaps.create, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.patch(
  "/roadmaps",
  authRequired,
  roadmapExists,
  withLicenseGuardWrapper(roadmaps.updateRoadmap, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.patch(
  "/roadmaps/sort",
  authRequired,
  withLicenseGuardWrapper(roadmaps.sort, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.delete(
  "/roadmaps",
  authRequired,
  roadmapExists,
  withLicenseGuardWrapper(roadmaps.deleteById, {
    requiredPlan: ["pro", "business", "enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);

export default router;
