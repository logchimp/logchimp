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
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

router.get(
  "/roles",
  authRequired,
  withLicenseGuard(roles.get, {
    requiredPlan: ["enterprise"],
  }),
);
router.get<IGetRoleByIdRequestParams>(
  "/roles/:role_id",
  // @ts-expect-error
  authRequired,
  roleExists,
  withLicenseGuard(roles.getOne, {
    requiredPlan: ["enterprise"],
  }),
);

router.post(
  "/roles",
  authRequired,
  withLicenseGuard(roles.create, {
    requiredPlan: ["enterprise"],
  }),
);

router.patch(
  "/roles",
  authRequired,
  roleExists,
  withLicenseGuard(roles.update, {
    requiredPlan: ["enterprise"],
  }),
);

router.put<IAssignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  authRequired,
  roleExists,
  userExists,
  withLicenseGuard(roles.addRoleToUser, {
    requiredPlan: ["enterprise"],
  }),
);

router.delete<TUnassignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  authRequired,
  roleExists,
  userExists,
  withLicenseGuard(roles.deleteRoleFromUser, {
    requiredPlan: ["enterprise"],
  }),
);

export default router;
