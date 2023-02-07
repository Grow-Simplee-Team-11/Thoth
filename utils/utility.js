import axios from "axios";
import config from "../config/config.js";
import Status from "../models/status.js";
import Package from "../models/package.js";
import Route from "../models/route.js";
import {setTimeout} from "timers/promises";
import {faker} from "@faker-js/faker";
import redis from "../database/redis.js";
import moment from "moment";
import fs from "fs";
import kmeans from "node-kmeans";

const RandomRange = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
Number.prototype.toRad = function () {
    return (this * Math.PI) / 180;
};

const haversineDistance = (riderCoordinates, pkgCoordinates) => {
    const lat1 = riderCoordinates.latitude / config.scalingFactor;
    const lon1 = riderCoordinates.longitude / config.scalingFactor;

    const lat2 = pkgCoordinates.latitude / config.scalingFactor;
    const lon2 = pkgCoordinates.longitude / config.scalingFactor;

    const R = 6371;
    var x1 = lat2 - lat1;
    var dLat = x1.toRad();
    var x2 = lon2 - lon1;
    var dLon = x2.toRad();
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getCoordinatesFromAddress = async address => {
    const data = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config.googleApiKey}`
    );
    return data;
};

const calcAverage = (pkg, type) => {
    let val = 0;
    pkg.forEach(p => {
        val += Number(p.dimensions[type]);
    });

    return val / pkg.length;
};

const filterError = (pkg, type) => {
    const avg = calcAverage(pkg, type);
    const change = pkg.reduce((acc, vap) => acc + Math.abs(vap.dimensions[type] - avg), 0);
    const error = (change * 100) / (pkg.length * avg);
    return {avg, error};
};

const calculateErrorfromPackage = pkg => {
    pkg = pkg.map(function (p) {
        const val = p.dimensions;
        Object.assign(p.dimensions, {volumetric: String(val.length * val.breadth * val.height)});
        return p;
    });

    const lengthError = filterError(pkg, "length");
    const breathError = filterError(pkg, "breadth");
    const heightError = filterError(pkg, "height");
    const weightError = filterError(pkg, "weight");
    const volumetricError = filterError(pkg, "volumetric");
    return {
        length: lengthError,
        breadth: breathError,
        height: heightError,
        weight: weightError,
        volume: volumetricError,
    };
};

const groupPackagesByLocation = packageList => {
    const groupedPackages = {};

    packageList.forEach(pkg => {
        const coordKey = String(pkg.coordinates.latitude) + String(pkg.coordinates.longitude);
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

function writeDataToFile(data) {
    fs.appendFileSync("./tmp/dispatch.txt", JSON.stringify(data.status) + " " + JSON.stringify(data.data) + "\n");
}

const addDropLocation = async row => {
    //google api fails for address startign with #
    // row example: ['addres','area','phone','name','sku_id','','',]
    console.log(row);
    if (row["address"].charAt(0) === "#") {
        row["address"] = row["address"].slice(1);
    }
    row["address"] = row["address"] + ", Bangalore";

    let data = await getCoordinatesFromAddress(row["address"]);

    writeDataToFile(data);
    data = data.data;

    if (data != undefined && data.results.length > 0) {
        const coordinates = {
            latitude: ~~(data.results[0]?.geometry.location.lat * config.scalingFactor),
            longitude: ~~(data.results[0]?.geometry.location.lng * config.scalingFactor),
            address: row["address"],
        };

        const redisCoordinates = {
            latitude: data.results[0]?.geometry.location.lat,
            longitude: data.results[0]?.geometry.location.lng,
        };

        const date = row["EDD"];
        const date_format = `${date} 09:00:00`;
        const momint = moment(date_format, "DD-MM-YYYY HH:mm:ss").valueOf();
        const m = ~~(momint / 1000);

        const images_list = [
            "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/clock.jpeg",
            "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/61Dw5Z8LzJL._SL1000_.jpg",
            "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/71i2XhHU3pL._SX466_.jpg",
            "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/download+(1).jpeg",
            "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/download+(2).jpeg",
            "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/download.jpeg",
            "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/pexels-math-90946+(1).jpg",
            "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/vwm915647-final-copy.jpg",
        ];

        const pkg = await Package.create({
            latest_status: "IN WAREHOUSE",
            awb_id: row["AWB"],
            deliver_to: {name: row["names"], phone_number: faker.phone.number("+919#########")},
            sku_id: row["product_id"],
            image_url: images_list[Math.floor(Math.random() * images_list.length)],
            type: "DELIVERY",
            coordinates,
            edd: m,
            dimensions: {
                length: Math.random() * 27 + 3,
                breadth: Math.random() * 27 + 3,
                height: Math.random() * 17 + 3,
                weight: Math.random() * 20 + 5,
            },
        });
        console.log(`Row ${row["names"]} saved`);
        await redis.addGeoData(redisCoordinates, pkg.id);
        await createStatus("IN WAREHOUSE", pkg._id);
    }
};

const createStatus = (status, package_id) => {
    return Status.create({status, package_id});
};

const checkError = async (length, breadth, height, weight, sku_id) => {
    const packages = await Package.find({sku_id: sku_id}, {dimensions: 1, _id: 0});
    const array = [];
    if (packages.length < 3) return "false";
    for (const pkg of packages) {
        array.push([pkg.dimensions.length, pkg.dimensions.breadth, pkg.dimensions.height, pkg.dimensions.weight]);
    }
    let new_data;
    let old_data = kmeans.clusterize(array, {k: 2}, (err, res) => {
        if (err) console.error(err);
        else return res;
    });

    console.log("old_data:", old_data.groups);

    array.push([length, breadth, height, weight]);
    new_data = kmeans.clusterize(array, {k: 2}, (err, res) => {
        if (err) console.error(err);
        else {
            return res;
        }
    });
    console.log("new_data", new_data.groups);

    const old_large_cluster = old_data.groups[0].clusterInd,
        old_small_cluster = old_data.groups[1].clusterInd;
    const new_large_cluster = new_data.groups[0].clusterInd,
        new_small_cluster = old_data.groups[1].clusterInd;

    if (old_large_cluster < new_large_cluster) return "NON_ERROR";
    else return "ERROR";
};

const createConfig = (start, waypoints, optimize) => {
    var waypointConfig = {
        method: "get",
        url: `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${start}&waypoints=optimize:${optimize}|${waypoints}&key=${config.googleApiKey}`,
        headers: {},
    };
    return waypointConfig;
};

const getRouteWaypoints = async () => {
    const routeList = await Route.find({}).populate("paths").lean();
    let routeWaypoints = {};
    for await (const route of routeList) {
        let waypoints = "";
        for await (const path of route.paths) {
            const latitude = path.coordinates.latitude / parseFloat(config.scalingFactor);
            const longitude = path.coordinates.longitude / parseFloat(config.scalingFactor);
            waypoints = waypoints.concat(`${latitude},${longitude}|`);
        }
        waypoints = waypoints.slice(0, -1);
        routeWaypoints[route._id.toString()] = waypoints;
    }
    return routeWaypoints;
};

const getDistanceFromWaypoint = async waypoints => {
    let hubLocation = JSON.parse(await redis.getWarehouse());

    hubLocation.latitude = hubLocation.latitude / parseFloat(config.scalingFactor);
    hubLocation.longitude = hubLocation.longitude / parseFloat(config.scalingFactor);

    const start = `${hubLocation.latitude},${hubLocation.longitude}`;
    const optimize = false;
    const waypointConfig = createConfig(start, waypoints, optimize);
    console.log(waypointConfig);
    const response = await axios(waypointConfig);
    const routes = response.data.routes;

    let distance = 0;
    let time = 0;
    try {
        for (const leg of routes[0].legs) {
            distance += leg.distance.value;
            time += leg.duration.value;
        }
    } catch (err) {
        console.log(err);
    }
    return distance;
};

export {
    RandomRange,
    getCoordinatesFromAddress,
    calculateErrorfromPackage,
    groupPackagesByLocation,
    haversineDistance,
    createStatus,
    addDropLocation,
    checkError,
    getRouteWaypoints,
    getDistanceFromWaypoint,
};
