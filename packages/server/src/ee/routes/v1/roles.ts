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
import { licenseGuard } from "../../middleware/licenseGuard";

router.get("/roles", licenseGuard, authRequired, roles.get);
router.get<IGetRoleByIdRequestParams>(
  "/roles/:role_id",
  // @ts-expect-error
  licenseGuard,
  authRequired,
  roleExists,
  roles.getOne,
);

router.post("/roles", licenseGuard, authRequired, roles.create);

router.patch("/roles", licenseGuard, authRequired, roleExists, roles.update);

router.put<IAssignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  licenseGuard,
  authRequired,
  roleExists,
  userExists,
  roles.addRoleToUser,
);

router.delete<TUnassignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  licenseGuard,
  authRequired,
  roleExists,
  userExists,
  roles.deleteRoleFromUser,
);

export default router;
