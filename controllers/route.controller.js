import catchAsync from "../utils/catchAsync.js";
import Rider from "../models/rider.js";
import Package from "../models/package.js";
import Route from "../models/route.js";
import { groupPackagesByLocation } from "../utils/utility.js";

const addRoute = catchAsync(async (req, res) => {
    const { rider_id, paths } = req.body;

    const route = await Route.create({rider_id, paths});
    console.log(route);
    res.status(200).json({message: "Route Added", route});
});

const getRouteDetails = catchAsync(async (req, res) => {
    const { route_id } = req.query;
    const route = await Route.findById(route_id).populate("paths");
    const rider = await Rider.findById(route.rider_id);
    const groupedPackages = groupPackagesByLocation(route.paths);

    res.status(200).json({ message: "Route Details", rider: rider, route: groupedPackages });
});

const getRouteList = catchAsync(async (req, res) => {
    const routeList = await Route.find({...req.query}).populate("paths");
    res.status(200).json({ message: "Route list", routes: routeList });
});

export default { addRoute, getRouteDetails, getRouteList };
