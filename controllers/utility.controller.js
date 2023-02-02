import formidable from "formidable";
import Package from "../models/package.js";
import catchAsync from "../utils/catchAsync.js";
import {calculateErrorfromPackage} from "../utils/utility.js";
import ApiError from "../utils/ApiError.js";
import fs from "fs";
import {parseStream} from "@fast-csv/parse";
import {addDropLocation} from "../utils/utility.js";
import rabbit from "../utils/rabbitmq.js";

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

            const csvParserStream = parseStream(readStream, {headers: false})
                .on("error", err => {
                    throw new ApiError(500, err);
                })
                .on("data", row => {
                    rows.push(row);
                    csvParserStream.end();
                    readStream.close();
                })
                .on("end", async () => {
                    await Promise.all(
                        rows.map(async rowObject => {
                            await addDropLocation(rowObject);
                        })
                    );

                    const channel = rabbit.getChannel();
                    channel.sendToQueue("grpc", Buffer.from(JSON.stringify({message: "Optimiser"})));
                    res.status(200).json({message: "Packages created"});
                });
            return;
        } catch (err) {
            throw new ApiError(500, err);
        }
    });
});
export {calculateError, uploadDeliveryFiles};
