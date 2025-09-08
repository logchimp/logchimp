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

router.get("/roles", authRequired, roles.get);
router.get<IGetRoleByIdRequestParams>(
  "/roles/:id",
  // @ts-expect-error
  authRequired,
  roleExists,
  roles.getOne,
);

router.post("/roles", authRequired, roles.create);

router.patch("/roles", authRequired, roleExists, roles.update);

// BETA: Assign role to a user
// todo: add userExists middleware
// todo: add roleExists middleware
router.put<IAssignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  authRequired,
  roles.addRoleToUser,
);

// BETA: Unassign role from a user
// todo: add userExists middleware
// todo: add roleExists middleware
router.delete<TUnassignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  authRequired,
  roles.deleteRoleFromUser,
);

export default router;
