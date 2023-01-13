// const express = require("express");

// const router = express.Router();
// const controllers = require("../controllers");

// //pending
// router.post("/dynamic", controllers.addPickup);

// router.post("/hub", controllers.addHub);

// router.get("/hub", controllers.getHub);

const express = require("express");
const riderRoute = require("./rider.route");

const config = require("../config/config");

const router = express.Router();

const defaultRoutes = [
    {
        path: "/rider",
        route: riderRoute,
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

module.exports = router; // module.exports = router;
