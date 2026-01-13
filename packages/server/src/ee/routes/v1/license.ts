// modules
import express from "express";
const router = express.Router();

// controller
import * as license from "../../controllers/v1/checkLicense";

router.get("/license", license.checkLicenseController);

export default router;
