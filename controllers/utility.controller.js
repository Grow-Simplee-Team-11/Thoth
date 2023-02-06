import formidable from "formidable";
import Package from "../models/package.js";
import Route from "../models/route.js";
import Notif from "../models/notifs.js";
import catchAsync from "../utils/catchAsync.js";
import {calculateErrorfromPackage} from "../utils/utility.js";
import fs from "fs";
import {parseStream} from "@fast-csv/parse";
import {addDropLocation} from "../utils/utility.js";
import config from "../config/config.js";

const calculateError = catchAsync(async (req, res) => {
    const {sku_id} = req.query;
    const packages = await Package.find({sku_id}, {dimensions: 1}).lean();
    const error = calculateErrorfromPackage(packages);

    res.status(200).json({message: "Calculated Error", error});
});

const uploadDeliveryFiles = catchAsync(async (req, res) => {
    const form = new formidable.IncomingForm();
    form.multiples = true;
    form.parse(req, async function (error, fields, files) {
        try {
            if (!files || !files.csv) {
                res.status(500).json({message: "File not sent"});
            }

            const readStream = fs.createReadStream(files.csv.filepath);
            let rows = [];

            const csvParserStream = parseStream(readStream, {headers: true})
                .on("error", err => {
                    res.status(500).json({message: "Error in parsing csv file"});
                })
                .on("data", row => {
                    rows.push(row);
                    csvParserStream.end();
                    readStream.close();
                })
                .on("end", async () => {
                    for await (const row of rows) {
                        console.log(new Date());
                        await addDropLocation(row);
                    }
                    res.status(200).json({message: "Packages created"});
                });
            return;
        } catch (err) {
            console.log(err);
            res.status(500).json({message: "Error in parsing csv file"});
        }
    });
});

const downloadGeoJSON = catchAsync(async (req, res) => {
    const fileLocation = "./tmp/geojson.json";
    const routeList = await Route.find({}).lean();
    const geoJSON = {
        type: "FeatureCollection",
        features: [],
    };

    console.log(routeList);

    for await (const route of routeList) {
        const pkgList = await Package.find({_id: {$in: route.paths}}, "coordinates").lean();
        const featureLine = {
            type: "Feature",
            properties: {},
            geometry: {
                coordinates: [],
                type: "LineString",
            },
        };
        for (const pkg of pkgList) {
            featureLine.geometry.coordinates.push([
                pkg.coordinates.longitude / parseFloat(config.scalingFactor),
                pkg.coordinates.latitude / parseFloat(config.scalingFactor),
            ]);
        }
        geoJSON.features.push(featureLine);
    }

    fs.writeFile("./tmp/geojson.json", JSON.stringify(geoJSON), err => {
        if (err) {
            throw err;
        }
        console.log("JSON data saved");
        res.download(fileLocation, function (err) {
            console.log(err);
        });
    });
});

const Warehouse_status = catchAsync(async (req, res) => {
    const notifs = await Notif.find({status_warehouse: "pending"}, {message: 1, route_id: 1}).lean();
    await Notif.updateMany({status_warehouse: "pending"}, {status_warehouse: "read"});
    res.status(200).json({message: "Warehouse status", notifs});
});

const rider_status = catchAsync(async (req, res) => {
    const notifs = await Notif.find({status_rider: "pending"}, {message: 1, route_id: 1}).lean();
    await Notif.updateMany({status_rider: "pending"}, {status_rider: "read"});
    res.status(200).json({message: "Warehouse status", notifs});
});

const route_stats = catchAsync(async (req, res) => {
    const total_packages = await Package.find({}).countDocuments();
    const delivered = await Package.find({latest_status: "DELIVERED"}).countDocuments();
    const fake_attempted = await Package.find({latest_status: "FAKE ATTEMPT"}).countDocuments();
    res.status(200).json({message: "Route stats", stats: {total_packages, delivered, fake_attempted}});
});

export {calculateError, uploadDeliveryFiles, downloadGeoJSON, Warehouse_status, rider_status, route_stats};
