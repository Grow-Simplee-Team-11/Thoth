import express from "express";
import controllers from "../controllers/rider.controller.js";

const router = express.Router();

router.post("/add", controllers.addRider);
router.get("/package", controllers.getPackageListFromRider);

router.get("/location", controllers.getRiderLocation);

router.post("/location", controllers.setRiderLocation);

router.patch("/location", controllers.updateRiderLocation);

export default router;
