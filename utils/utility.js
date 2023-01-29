import axios from "axios";
import config from "../config/config.js";
import Status from "../models/status.js";
import Package from "../models/package.js";
import {setTimeout} from "timers/promises";
import {faker} from "@faker-js/faker";
import redis from "../database/redis.js";

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
    await setTimeout(25);
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

const addDropLocation = async row => {
    //google api fails for address startign with #
    // row example: ['addres','area','phone','name','sku_id','','',]

    if (row[0].charAt(0) === "#") {
        row[0] = row[0].slice(1);
    }

    const {data} = await getCoordinatesFromAddress(row[0]);

    if (data != undefined && data.results.length > 0) {
        const coordinates = {
            latitude: ~~(data.results[0]?.geometry.location.lat * config.scalingFactor),
            longitude: ~~(data.results[0]?.geometry.location.lng * config.scalingFactor),
            address: row[0],
        };

        const redisCoordinates = {
            latitude: data.results[0]?.geometry.location.lat,
            longitude: data.results[0]?.geometry.location.lng,
        };

        const pkg = await Package.create({
            status: "IN_WAREHOUSE",
            awb_id: faker.datatype.uuid(),
            deliver_to: {name: row[3], phone_number: row[2]},
            sku_id: row[4],
            image_url: "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/clock.jpeg",
            type: "DELIVERY",
            coordinates,
            dimensions: {
                length: Math.random() * 27 + 3,
                breadth: Math.random() * 27 + 3,
                height: Math.random() * 17 + 3,
                weight: Math.random() * 20 + 5,
            },
        });
        console.log(`Row ${row[3]} saved`);
        await redis.addGeoData(redisCoordinates, pkg.id);
        await createStatus("IN_WAREHOUSE", pkg._id);
    }
};

const createStatus = (status, package_id) => {
    return Status.create({status, package_id});
};

export {
    RandomRange,
    getCoordinatesFromAddress,
    calculateErrorfromPackage,
    groupPackagesByLocation,
    haversineDistance,
    createStatus,
    addDropLocation,
};
