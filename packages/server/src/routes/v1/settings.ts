// modules
import path from "path";
import express from "express";
const router = express.Router();
import multer from "multer";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, "../../../content/images"));
  },
  filename: (_req, file, cb) => {
    const fileExtension =
      file.originalname.split(".")[file.originalname.split(".").length - 1];
    const fileName = Date.now().toString(32);

    cb(null, `${fileName}.${fileExtension}`);
  },
});

const upload = multer({
  storage,
});

// controller
import * as settings from "../../controllers/settings";

// middleware
import { authRequired } from "../../middlewares/auth";

router.get("/settings/site", settings.siteSettings);
router.patch("/settings/site", authRequired, settings.update);
router.post(
  "/settings/update-logo",
  authRequired,
  upload.single("logo", 1),
  settings.updateLogo,
);
router.get("/settings/labs", settings.getLabs);
router.patch("/settings/labs", authRequired, settings.updateLabs);

export default router;
