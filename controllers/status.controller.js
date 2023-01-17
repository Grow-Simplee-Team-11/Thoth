import catchAsync from "../utils/catchAsync.js";
import Package from "../models/package.js";
import Status from "../models/status.js";

const updateStatus = catchAsync(async (req, res) => {
    const {status, package_id} = req.body;

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
