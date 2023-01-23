import catchAsync from "../utils/catchAsync.js";
import Package from "../models/package.js";
import Status from "../models/status.js";
import config from "../config/config.js";
import redis from "../database/redis.js";
import {getCoordinatesFromAddress} from "../utils/utility.js";

// const createItem = async (name, dimensions) => {
//     const item = await Item.findOne({name});
//     if (item) {
//         return item;
//     }
//     return await Item.create({
//         name,
//         dimensions,
//     });
// };

// const addItem = catchAsync(async (req, res) => {
//     const {name, dimensions} = req.body;
//     const item = createItem(name, dimensions);
//     console.log(item);
//     res.status(200).json({message: "Item Added", item});
// });

const addDeliveryPackage = catchAsync(async (req, res) => {
    const {awb_id, sku_id, deliver_to, address, dimensions, type} = req.body;
    const {data} = await getCoordinatesFromAddress(address);
    const coordinates = {
        latitude: data.results[1].geometry.location.lat,
        longitude: data.results[1].geometry.location.lng,
        address,
    };
    const deliveryPackage = await Package.create({
        awb_id,
        sku_id,
        deliver_to: {
            name: deliver_to.name,
            phone_number: deliver_to.phone_number,
        },
        dimensions,
        coordinates: {
            latitude: Math.floor(coordinates.latitude * config.scalingFactor),
            longitude: Math.floor(coordinates.longitude * config.scalingFactor),
            address,
        },
        type,
    });
    console.log(deliveryPackage);
    await redis.addGeoData(coordinates, deliveryPackage.id);
    res.status(200).json({message: "Delivery Package Added", deliveryPackage});
});

const getPackageDetails = catchAsync(async (req, res) => {
    const {package_id} = req.query;
    const pkg = await Package.findById(package_id);
    const status = await Status.find({package_id}, "status createdAt -_id");
    res.status(200).json({message: "Package Details", pkg, status});
});

const getPackageList = catchAsync(async (req, res) => {
    // const {awb_id} = req.query;
    const pkg = await Package.find({...req.query});
    res.status(200).json({message: "Package List", package: pkg});
});

const uploadImageController = catchAsync(async (req, res) => {
    const {awb_id} = req.query;
    const fileName = req.file.location;
    const pkg = await Package.findOneAndUpdate(awb_id, {image_url: fileName});
    res.status(200).json({message: "Image uploaded", pkg});
});

export default {
    getCoordinatesFromAddress,
    addDeliveryPackage,
    getPackageDetails,
    getPackageList,
    uploadImageController,
};
