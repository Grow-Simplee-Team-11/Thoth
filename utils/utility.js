import axios from "axios";
import config from "../config/config.js";
import Status from "../models/status.js";
import Package from "../models/package.js";
import {setTimeout} from "timers/promises";
import {faker} from "@faker-js/faker";
import redis from "../database/redis.js";
import KNN from "ml-knn";
import moment from "moment";
import fs from "fs";
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

        const pkg = await Package.create({
            latest_status: "IN WAREHOUSE",
            awb_id: row["AWB"],
            deliver_to: {name: row["names"], phone_number: faker.phone.number("+919#########")},
            sku_id: row["product_id"],
            image_url: "https://public-images-inter-iit.s3.ap-south-1.amazonaws.com/clock.jpeg",
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

    const train = [];
    for (let i = 0; i < array.length - 1; i++) {
        train.push(0);
    }
    train.push(1);
    console.log(array, train);
    let knn = new KNN(array, train, {k: 3});

    const test_dataset = [[Number(length), Number(breadth), Number(height), Number(weight)]];
    console.log(test_dataset);
    let result = knn.predict(test_dataset);
    return result[0] === 1 ? "Erroneous" : "Not Errorneous";
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
};
