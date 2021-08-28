// modules
const express = require("express");
const router = express.Router();

// controller
const roles = require("../../controllers/roles");

// middleware
const middleware = require("../../middlewares");
const roleExists = require("../../middlewares/roleExists");

router.get("/roles", middleware.apiAuth, roles.get);
router.get("/roles/:id", middleware.apiAuth, roleExists, roles.getOne);

router.post("/roles", middleware.apiAuth, roles.create);

router.patch("/roles", middleware.apiAuth, roleExists, roles.update);


module.exports = router;
