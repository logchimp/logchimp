// modules
const express = require("express");
const router = express.Router();

// controller
const users = require("../../controllers/users");

router.get("/users/:userId", users.userById);
router.patch("/user", users.updateUser);

module.exports = router;
