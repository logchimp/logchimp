// modules
import express from "express";
const router = express.Router();

// controller
import * as roles from "../../controllers/v1/roles";

// middleware
import * as middleware from "../../../middlewares";
import roleExists from "../../middleware/roleExists";

router.get("/roles", middleware.apiAuth, roles.get);
router.get("/roles/:id", middleware.apiAuth, roleExists, roles.getOne);

router.post("/roles", middleware.apiAuth, roles.create);

router.patch("/roles", middleware.apiAuth, roleExists, roles.update);

// BETA: Assign role to a user
// todo: add userExists middleware
// todo: add roleExists middleware
router.put(
  "/roles/:role_id/users/:user_id",
  middleware.apiAuth,
  roles.addRoleToUser,
);

// BETA: Unassign role from a user
// todo: add userExists middleware
// todo: add roleExists middleware
router.delete(
  "/roles/:role_id/users/:user_id",
  middleware.apiAuth,
  roles.deleteRoleFromUser,
);

export default router;
