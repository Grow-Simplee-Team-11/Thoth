import catchAsync from "../utils/catchAsync.js";
import rabbit from "../utils/rabbitmq.js";

const startOptimiser = catchAsync(async (req, res) => {
    const channel = rabbit.getChannel();
    channel.sendToQueue("grpc", Buffer.from(JSON.stringify({message: "Optimiser"})));
    res.status(200).json({message: "Optimiser Started"});
});

const startDynamicPickup = catchAsync(async (req, res) => {
    const pkg = req.body;
    const channel = rabbit.getChannel();
    channel.sendToQueue("dynamic", Buffer.from(JSON.stringify({message: "Dynamic Pickup", pkg})));
    res.status(200).json({message: "Dynamic Pickup Started"});
});

export default {startOptimiser, startDynamicPickup};
