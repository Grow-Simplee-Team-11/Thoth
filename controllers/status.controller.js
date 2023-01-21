import catchAsync from "../utils/catchAsync.js";
import Package from "../models/package.js";
import Status from "../models/status.js";
import {haversineDistance} from "../utils/utility.js";
import redis from "../database/redis.js";

const updateStatus = catchAsync(async (req, res) => {
    let {status, package_id, rider_id} = req.body;
    const pkg = await Package.findById(package_id);

    if (status === "DELIVERED") {
        const rider = JSON.parse(await redis.getRiderData(rider_id));

        const distance = haversineDistance(rider.coordinates, pkg.coordinates);
        console.log(distance);
        if (distance >= 0.2) {
            status = "FAKE_ATTEMPT";
        }
    }

    const statusItem = await Status.create({status, package_id});
    Package.findByIdAndUpdate(package_id, {latest_status: status}, function (err) {
        if (err) {
            console.log(err);
        }
    });

    console.log(statusItem);
    res.status(201).json({message: "Status Updated", statusItem});
});

export default {updateStatus};
