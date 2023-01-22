import catchAsync from "../utils/catchAsync.js";

const startOptimiser = catchAsync(async (req, res) => {
    res.status(200).json({message: "Optimiser Started"});
});

export default {startOptimiser};
