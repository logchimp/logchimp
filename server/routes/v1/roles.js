// modules
const express = require("express");
const router = express.Router();

// controller
const roles = require("../../controllers/roles");

// middleware
const middleware = require("../../middlewares");
const exists = require("../../middlewares/roleExists");

router.get("/roles", middleware.apiAuth, roles.get);
router.get("/roles/:id", middleware.apiAuth, exists, roles.getOne);

router.post("/roles", middleware.apiAuth, roles.create);

router.patch("/roles", middleware.apiAuth, exists, roles.update);

module.exports = router;
