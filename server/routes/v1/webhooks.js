// modules
const express = require("express");
const router = express.Router();

// controller
const webhooks = require("../../controllers/webhooks");

router.get("/webhooks", webhooks.get);
router.get("/webhooks/:id", webhooks.getOne);

router.post("/webhooks", webhooks.create);

router.put("/webhooks/:id", webhooks.update);
router.delete("/webhooks/:id", webhooks.destroy);

module.exports = router;
