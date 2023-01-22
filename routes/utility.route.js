import express from "express";
import {calculateError} from "../controllers/utility.controller.js";

const router = express.Router();

router.get("/error", calculateError);

export default router;
