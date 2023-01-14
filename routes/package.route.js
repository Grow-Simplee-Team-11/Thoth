import express from "express";
import controllers from "../controllers/package.controller.js";
const router = express.Router();

router.post("/delivery", controllers.addDeliveryPackage);

export default router;
