import mongoose from "mongoose";
import Package from "../models/package.js";
import {faker} from "@faker-js/faker";
import fs from "fs";
import config from "../config/config.js";
import logger from "../config/logger.js";
import {createStatus, getCoordinatesFromAddress} from "../utils/utility.js";
import {parse} from "csv-parse";
import {promisify} from "util";

const generateRandomData = (address, coordinate) => {
    const data = {
        image_url: "https://via.placeholder.com/150",
        sku_id: "SKU_" + ~~(Math.random() * 100 + 1),
        awb_id: Math.random().toString(36).substring(2, 15),
        deliver_to: {
            name: faker.name.fullName(),
            phone_number: faker.phone.number("+919#########"),
        },
        coordinates: {
            latitude: ~~(coordinate.lat * 1000000),
            longitude: ~~(coordinate.lng * 1000000),
            address: address,
        },
        dimensions: {
            length: Math.floor(Math.random() * 37) + 3,
            breadth: Math.floor(Math.random() * 37) + 3,
            height: Math.floor(Math.random() * 17) + 3,
            weight: Math.floor(Math.random() * 29) + 1,
        },
        delivered_time: new Date(),
        type: ["DELIVERY", "PICKUP"][Math.floor(Math.random() * 2)],
        latest_status: "IN_WAREHOUSE",
    };
    return data;
};

let results = [];
const promise = [];
var i = 0;

async function readCSV() {
    return promisify(
        fs
            .createReadStream("./scripts/dispatch.csv")
            .pipe(parse({delimiter: ","}))
            .on("data", row => {
                results.push(row);
            })
            .on("end", async err => {
                console.log(results.length);
            })
    );
}

async function init() {
    await readCSV();
    console.log(results);
}

init();
// await mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
//     console.log("Mongoose connected");
// });
// await Promise.all(
//     results.map(async result => {
//         if (result[0].charAt(0) === "#") {
//             result[0] = result[0].slice(1);
//         }
//         const {data} = await getCoordinatesFromAddress(result[0]);
//         i++;
//         if (data != undefined && data.results.length > 0) {
//             const pkg = generateRandomData(result[0], data.results[0]?.geometry.location);
//             const dispatch = new Package(pkg);
//             console.log(dispatch);
//             promise.push(dispatch.save());
//             // createStatus(dispatch.id, "IN_WAREHOUSE"));
//         }
//     })
// ).then(async () => {
//     console.log(promise.length, i);
//     await Promise.all(promise);

//     await mongoose.disconnect();
// });
