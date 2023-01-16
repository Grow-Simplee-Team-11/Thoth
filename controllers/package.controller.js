import catchAsync from "../utils/catchAsync.js";
import Rider from "../models/rider.js";
import Item from "../models/item.js";
import Package from "../models/package.js";
import config from "../config/config.js";
import axios from "axios";
import redis from "../database/redis.js";
import {getCoordinatesFromAddress} from "../utils/utility.js";

const createItem = async (name, dimensions) => {
    const item = await Item.findOne({name});
    if (item) {
        return item;
    }
    return await Item.create({
        name,
        dimensions,
    });
};

const addItem = catchAsync(async (req, res) => {
    const {name, dimensions} = req.body;
    const item = createItem(name, dimensions);
    console.log(item);
    res.status(200).json({message: "Item Added", item});
});

const addDeliveryPackage = catchAsync(async (req, res) => {
    const {name, deliver_to, address, sku_id, dimensions} = req.body;
    const {data} = await getCoordinatesFromAddress(address);
    const coordinates = {
        latitude: data.results[1].geometry.location.lat,
        longitude: data.results[1].geometry.location.lng,
        address,
    };
    const item = await createItem(sku_id, dimensions);
    const deliveryPackage = await Package.create({
        name,
        item_id: await item.id,
        deliver_to: {
            name: deliver_to.name,
            phone_number: deliver_to.phone_number,
        },
        coordinates: {
            latitude: Math.floor(coordinates.latitude * config.scalingFactor),
            longitude: Math.floor(coordinates.longitude * config.scalingFactor),
            address,
        },
        type: "DELIVERY",
    });
    console.log(deliveryPackage);
    await redis.addGeoData(coordinates, deliveryPackage.id);
    res.status(200).json({message: "Delivery Package Added", deliveryPackage});
});

const getPackageDetails = catchAsync(async (req, res) => {
    const {package_id} = req.query;
    const pkg = await Package.findById(package_id);
    const item = await Item.findById(pkg.item_id);
    const rider = await Rider.findById(pkg.rider_id);
    res.status(200).json({message: "Package Details", pkg: pkg, item: item, rider: rider});
});

const getPackageList = catchAsync(async (req, res) => {
    const {sku_id} = req.query;
    const item = await Item.findOne({name: sku_id});
    const pkgList = await Package.find({item_id: item.id});
    res.status(200).json({message: "Package List", pkgList: pkgList});
});

export {createItem, getCoordinatesFromAddress, addItem, addDeliveryPackage, getPackageDetails, getPackageList};
