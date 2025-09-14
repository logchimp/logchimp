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

router.get("/roles", authRequired, roles.get);
router.get<IGetRoleByIdRequestParams>(
  "/roles/:role_id",
  // @ts-expect-error
  authRequired,
  roleExists,
  roles.getOne,
);

router.post("/roles", authRequired, roles.create);

router.patch("/roles", authRequired, roleExists, roles.update);

router.put<IAssignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  authRequired,
  roleExists,
  userExists,
  roles.addRoleToUser,
);

router.delete<TUnassignRoleToUserRequestParams>(
  "/roles/:role_id/users/:user_id",
  // @ts-expect-error
  authRequired,
  roleExists,
  userExists,
  roles.deleteRoleFromUser,
);

export default router;
