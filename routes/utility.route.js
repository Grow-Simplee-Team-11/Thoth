import express from "express";
import {calculateError, uploadDeliveryFiles, downloadGeoJSON} from "../controllers/utility.controller.js";

const router = express.Router();

router.get("/error", calculateError);
router.post("/csv/package", uploadDeliveryFiles);
router.get("/geojson/download", downloadGeoJSON);

export default router;
