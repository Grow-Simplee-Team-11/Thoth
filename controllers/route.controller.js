import catchAsync from "../utils/catchAsync.js";
import Rider from "../models/rider.js";
import Package from "../models/package.js";
import Route from "../models/route.js";
import {groupPackagesByLocation} from "../utils/utility.js";

const addRoute = catchAsync(async (req, res) => {
    const {rider_id, paths} = req.body;

    const route = await Route.create({rider_id, paths});
    console.log(route);
    res.status(200).json({message: "Route Added", route});
});

const getRouteDetails = catchAsync(async (req, res) => {
    const {route_id} = req.query;
    const route = await Route.findById(route_id).populate("paths");
    const rider = await Rider.findById(route.rider_id);
    const groupedPackages = groupPackagesByLocation(route.paths);
    const numberOfGroups = groupedPackages.length;
    const numberOfPackages = route.paths.length;

    res.status(200).json({
        message: "Route Details",
        rider: rider,
        route: groupedPackages,
        number_points: numberOfGroups,
        number_packages: numberOfPackages,
    });
});

const getRouteList = catchAsync(async (req, res) => {
    let routeList = await Route.find({...req.query})
        .populate("paths")
        .lean();

    routeList = routeList.map(routeItem => {
        let ri = routeItem;
        const groupedPackages = groupPackagesByLocation(routeItem.paths);
        ri.route = groupedPackages;
        ri.number_points = groupedPackages.length;
        ri.number_packages = routeItem.paths.length;
        delete ri.paths;

        return ri;
    });
    res.status(200).json({message: "Route list", routes: routeList});
});

export default {addRoute, getRouteDetails, getRouteList};
