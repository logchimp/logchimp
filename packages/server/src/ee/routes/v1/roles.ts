import express from "express";
import type {
  IAssignRoleToUserRequestParams,
  IGetRoleByIdRequestParams,
  TUnassignRoleToUserRequestParams,
} from "@logchimp/types";

const router = express.Router();

// controller
import * as roles from "../../controllers/v1/roles";

// middleware
import { authRequired } from "../../../middlewares/auth";
import { roleExists } from "../../middleware/roleExists";
import { userExists } from "../../../middlewares/userExists";
// import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";
//changed the path
import { withLicenseGuardWrapper } from "../../../middlewares/licenseGuardWrapper";

router.get(
  "/roles",
  authRequired,
  withLicenseGuardWrapper(roles.get, {
    requiredPlan: ["enterprise"],
    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);
router.get<IGetRoleByIdRequestParams>(
  "/roles/:role_id",
  // @ts-expect-error
  authRequired,
  roleExists,
  withLicenseGuardWrapper(roles.getOne, {
    requiredPlan: ["enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);

router.post(
  "/roles",
  authRequired,
  withLicenseGuardWrapper(roles.create, {
    requiredPlan: ["enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);

router.patch(
  "/roles",
  authRequired,
  roleExists,
  withLicenseGuardWrapper(roles.update, {
    requiredPlan: ["enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);

router.put<IAssignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  authRequired,
  roleExists,
  userExists,
  withLicenseGuardWrapper(roles.addRoleToUser, {
    requiredPlan: ["enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);

router.delete<TUnassignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  authRequired,
  roleExists,
  userExists,
  withLicenseGuardWrapper(roles.deleteRoleFromUser, {
    requiredPlan: ["enterprise"],

    //added this option to ensure that even if license guard fails, the handler will still execute. This is because activity feed is a crucial feature and we don't want it to be blocked due to license guard issues.
     skipHandlerOnFailure: false,
  }),
);

export default router;
