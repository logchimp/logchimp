// modules
const path = require("path");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, "../../../content/images"));
	},
	filename: (req, file, cb) => {
		const fileExtension = file.originalname.split(".")[
			file.originalname.split(".").length - 1
		];
		const fileName = Date.now().toString(32);

		cb(null, `${fileName}.${fileExtension}`);
	}
});

const upload = multer({
	storage
});

// controller
const settings = require("../../controllers/settings");

// middleware
const token = require("../../middlewares/token");

router.get("/settings/site", settings.siteSettings);
router.patch("/settings/site", token, settings.update);
router.post(
	"/settings/update-logo",
	token,
	upload.single("logo", 1),
	settings.updateLogo
);

module.exports = router;
