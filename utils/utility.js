import axios from "axios";
import config from "../config/config.js";
import Package from "../models/package.js";
import Route from "../models/route.js";

const RandomRange = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

const getCoordinatesFromAddress = address => {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config.googleApiKey}`);
};

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


const getPackageData = (packageId) => {
    return Package.findById(packageId);
};

const getRouteData = async (route) => {
    console.log("route =", route);
    // const route = await Route.findById(routeId);
    const pkgList = await Promise.all(route.paths.map(getPackageData));
    console.log("pkgs =", pkgList);
    const groupedPackages = groupPackagesByLocation(pkgList);
    
    const routeObject = {
        packages: groupedPackages,
    }

    return await routeObject;
};

export { RandomRange, getCoordinatesFromAddress, groupPackagesByLocation, getPackageData, getRouteData };
