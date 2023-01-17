import express from "express";
import {calculateError} from "../controllers/utitlity.controller.js";

const router = express.Router();

router.get("/error", calculateError);

export default router;
