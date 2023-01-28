import formidable from "formidable";
import Package from "../models/package.js";
import catchAsync from "../utils/catchAsync.js";
import {calculateErrorfromPackage} from "../utils/utility.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs";
import {parseStream} from "@fast-csv/parse";

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
            console.log(files);
            if (!files || !files.csv) {
                throw new ApiError(500, "File not sent");
            }

            const readStream = fs.createReadStream(files.csv.filepath);
            let rows = [];

            const csvParserStream = parseStream(readStream, {headers: true})
                .on("error", err => {
                    throw new ApiError(500, err);
                })
                .on("data", row => {
                    rows.push(row);
                    csvParserStream.end();
                    readStream.close();
                })
                .on("end", () => {
                    console.log(rows);
                    res.status(200).json({message: "Hi world"});
                });
            return;
        } catch (err) {
            throw new ApiError(500, err);
        }
    });
});
export {calculateError, uploadDeliveryFiles};
