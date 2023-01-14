import catchAsync from "../utils/catchAsync.js";
import Item from "../models/item.js";
import Package from "../models/package.js";
import {faker} from "@faker-js/faker";
import {RandomRange} from "../utils/utility.js";
import config from "../config/config.js";
import axios from "axios";
import redis from "../database/redis.js";

const addItem = catchAsync(async (req, res) => {
    const {name, dimensions} = req.body;
    const item = await Item.create({
        name,
        dimensions,
    });
    console.log(item);
    res.status(200).json({message: "Item Added", item});
});

const getCoordinatesFromAddress = (address) => {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config.googleApiKey}`);
}

const addDeliveryPackage = catchAsync(async (req, res) => {
    const {name, item_id, deliver_to, address} = req.body;
    const {data} = await getCoordinatesFromAddress(address);
    const coordinates = {
        latitude: data.results[1].geometry.location.lat,
        longitude: data.results[1].geometry.location.lng,
        address
    };
    const deliveryPackage = await Package.create({
        name,
        item_id,
        deliver_to: {
            name: deliver_to.name,
            phone_number: deliver_to.phone_number,
        },
        coordinates,
        type: 'DELIVERY',
    });
    console.log(deliveryPackage);
    await redis.addGeoData(coordinates, deliveryPackage.id);
    res.status(200).json({message: "Delivery Package Added", deliveryPackage});
});

export default {addItem, addDeliveryPackage};