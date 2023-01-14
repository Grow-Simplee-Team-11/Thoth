import express from "express";
import controllers from "../controllers/package.controller.js";
const router = express.Router();

router.post("/delivery", controllers.addDeliveryPackage);
router.post("/details", controllers.getPackageDetails);

export default router;
