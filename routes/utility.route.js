import express from "express";
import {calculateError, uploadDeliveryFiles} from "../controllers/utility.controller.js";

const router = express.Router();

router.get("/error", calculateError);
router.post("/csv/package", uploadDeliveryFiles);

export default router;
