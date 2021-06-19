// modules
const express = require("express");
const router = express.Router();

// controller
const comments = require("../../controllers/comments");

// middleware
const middleware = require("../../middlewares");

router.post("/comments", middleware.apiAuth, comments.create);
router.put("/comments/:comment_id", middleware.apiAuth, comments.update);
router.delete("/comments", middleware.apiAuth, comments.destroy);

module.exports = router;
