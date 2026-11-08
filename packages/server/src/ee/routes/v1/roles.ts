import express from "express";
import type { operations } from "@logchimp/api-ts-types";

// controller
import * as roles from "../../controllers/v1/roles";

// middleware
import { authRequired } from "../../../middlewares/auth";
import { roleExists } from "../../middleware/roleExists";
import { userExists } from "../../../middlewares/userExists";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

const router = express.Router();

router.get(
  "/roles",
  authRequired,
  withLicenseGuard(roles.get, {
    requiredPlan: ["enterprise"],
  }),
);
router.get<operations["getRoleByID"]["parameters"]["path"]>(
  "/roles/:role_id",
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

router.put<operations["assignRoleToUser"]["parameters"]["path"]>(
  "/roles/:role_id/users/:user_id",
  authRequired,
  roleExists,
  userExists,
  withLicenseGuard(roles.addRoleToUser, {
    requiredPlan: ["enterprise"],
  }),
);

router.delete<operations["unassignRoleFromUser"]["parameters"]["path"]>(
  "/roles/:role_id/users/:user_id",
  authRequired,
  roleExists,
  userExists,
  withLicenseGuard(roles.deleteRoleFromUser, {
    requiredPlan: ["enterprise"],
  }),
);

export default router;
