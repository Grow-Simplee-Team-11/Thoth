// const express = require("express");

// const router = express.Router();
// const controllers = require("../controllers");

// //pending
// router.post("/dynamic", controllers.addPickup);

// router.post("/hub", controllers.addHub);

// router.get("/hub", controllers.getHub);

import express from "express";
import riderRoute from "./rider.route.js";
import packageRoute from "./package.route.js";
import authRoute from "./auth.route.js";
import utilityRoute from "./utility.route.js";
import config from "../config/config.js";

const router = express.Router();

const defaultRoutes = [
    {
        path: "/rider",
        route: riderRoute,
    },
    {
        path: "/package",
        route: packageRoute,
    },
    {
        path: "/auth",
        route: authRoute,
    },
    {
        path: "/util",
        route: utilityRoute,
    },
];

const devRoutes = [
    // routes available only in development mode
    // {
    //     path: "/docs",
    //     route: docsRoute,
    // },
];

defaultRoutes.forEach(route => {
    router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
    devRoutes.forEach(route => {
        router.use(route.path, route.route);
    });
}

export default router; // module.exports = router;
