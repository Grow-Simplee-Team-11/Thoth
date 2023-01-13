import express from "express";
import controllers from "../controllers/rider.controller.js";

const router = express.Router();
router.get("/location", controllers.getRider);

router.post("/location", controllers.setRider);

router.patch("/location", controllers.updateRider);

export default router;
