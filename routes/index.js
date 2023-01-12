const express = require("express");

const router = express.Router();
const controllers = require("../controllers");

//pending
router.post("/dynamic", controllers.addPickup);

router.post("/hub", controllers.addHub);

router.get("/hub", controllers.getHub);

router.patch("/rider", controllers.updateRider);

router.get("/rider", controllers.getRider);

router.post("/rider", controllers.setRider);

module.exports = router;
