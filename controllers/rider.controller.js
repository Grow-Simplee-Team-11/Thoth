import redis from "../database/redis.js";
import request from "../utils/request.js";
// import dynamicClient from "../client/dynamic.js";

import catchAsync from "../utils/catchAsync.js";

const updateRider = catchAsync(async (req, res) => {
    const {id, location} = req.body;
    const rider = JSON.parse(await redis.getRiderData(id.toString()));
    rider.location = location;
    await redis.updateRiderData(rider.id, rider);
    res.status(200).json({message: "data updated"});
});

const setRider = catchAsync(async (req, res) => {
    await redis.setRiderData(req.body);
    res.status(200).json({message: "New Rider Added"});
});

const getRider = catchAsync(async (req, res) => {
    const rider = JSON.parse(await redis.getRiderData(req.query.id));
    res.status(200).json({rider});
});

export default {getRider, setRider, updateRider};
