import Package from "../models/package.js";
import catchAsync from "../utils/catchAsync.js";
import {calculateErrorfromPackage} from "../utils/utility.js";

const calculateError = catchAsync(async (req, res) => {
    const {sku_id} = req.query;
    const packages = await Package.find({sku_id}, {dimensions: 1}).lean();
    const error = calculateErrorfromPackage(packages);

    res.status(200).json({message: "Calculated Error", error});
});

export {calculateError};
