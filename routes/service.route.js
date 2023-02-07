import express from "express";
import controllers from "../controllers/service.controller.js";

const router = express.Router();

router.get("/start", controllers.startOptimiser);
router.post("/dynamic", controllers.startDynamicPickup);

export default router;
