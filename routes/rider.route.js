const express = require("express");

const router = express.Router();
const controllers = require("../controllers/rider.controller");

router.get("/location", controllers.getRider);

router.post("/location", controllers.setRider);

router.patch("/location", controllers.updateRider);

module.exports = router;
