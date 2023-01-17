import redis from "../database/redis.js";
import catchAsync from "../utils/catchAsync.js";
import Rider from "../models/rider.js";
import Package from "../models/package.js";
import {faker} from "@faker-js/faker";

const groupPackagesByLocation = packageList => {
    const groupedPackages = {};

    packageList.forEach(pkg => {
        const coordKey = String(pkg.coordinates.latitude) + String(pkg.coordinates.longitude);
        console.log(coordKey);
        if (groupedPackages[coordKey]) {
            groupedPackages[coordKey].push(pkg);
        } else {
            groupedPackages[coordKey] = [pkg];
        }
    });

    let groupedPackagesByLocation = [];
    for (const [coordKey, pkgList] of Object.entries(groupedPackages)) {
        const groupedObject = {};
        groupedObject.packages = pkgList;
        groupedObject.coordinates = pkgList[0].coordinates;
        groupedPackagesByLocation.push(groupedObject);
    }

    return groupedPackagesByLocation;
};

const addRider = catchAsync(async (req, res) => {
    const {name, phone} = req.body;
    const rider = await Rider.create({name: faker.name.fullName(), phone: faker.phone.number("+91##########")});
    console.log(rider);
    res.status(200).json({message: "Rider Added", rider});
});

const updateRiderLocation = catchAsync(async (req, res) => {
    const {id, location} = req.body;
    const rider = JSON.parse(await redis.getRiderData(id.toString()));
    rider.location = location;
    await redis.updateRiderData(rider.id, rider);
    res.status(200).json({message: "data updated"});
});

const setRiderLocation = catchAsync(async (req, res) => {
    await redis.setRiderData(req.body);
    res.status(200).json({message: "New Rider Added"});
});

const getRiderLocation = catchAsync(async (req, res) => {
    const rider = JSON.parse(await redis.getRiderData(req.query.id));
    await Rider.create({
        name: "Rajiv",
        phone: "+91100",
        paths: [1, 2, 3],
    });
    res.status(200).json({rider});
});

const getRiderDetails = catchAsync(async (req, res) => {
    const {rider_id} = req.query;
    const rider = await Rider.findById(rider_id);
    const packageList = await Package.find({rider_id});
    const groupedPackageList = groupPackagesByLocation(packageList);
    res.status(200).json({message: "Rider Details", rider: rider, packages: groupedPackageList});
});

export default {setRiderLocation, getRiderLocation, updateRiderLocation, addRider, getRiderDetails};
