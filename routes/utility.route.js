import express from "express";
import {
    calculateError,
    uploadDeliveryFiles,
    downloadGeoJSON,
    Warehouse_status,
    rider_status,
    route_stats,
} from "../controllers/utility.controller.js";

const router = express.Router();

router.get("/error", calculateError);
router.post("/csv/package", uploadDeliveryFiles);
router.get("/geojson/download", downloadGeoJSON);
router.get("/notif/warehouse", Warehouse_status);
router.get("/notif/rider", rider_status);
router.get("/stats", route_stats);

export default router;
