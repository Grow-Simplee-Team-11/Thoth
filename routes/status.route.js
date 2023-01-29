import express from "express";
import controllers from "../controllers/status.controller.js";

const router = express.Router();

router.post("/update", controllers.updateStatus);
// router.post("/undeliver", controllers.)

export default router;
