// modules
import express from "express";
const router = express.Router();

// controller
import * as license from "../../controllers/v1/license";

router.get("/check-license", license.checkLicense);

export default router;
