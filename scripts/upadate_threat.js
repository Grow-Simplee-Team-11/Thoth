import mongoose from "mongoose";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const Schema = mongoose.Schema;
const packageSchema = new Schema(
    {
        image_url: {type: String},
        sku_id: {type: String},
        awb_id: {type: String},

        deliver_to: {name: {type: String}, phone_number: {type: String}},

        coordinates: {
            latitude: {type: Number},
            longitude: {type: Number},
            address: {type: String},
        },
        dimensions: {
            length: {type: Number, default: 0},
            breadth: {type: Number, default: 0},
            height: {type: Number, default: 0},
            weight: {type: Number, default: 0},
        },
        delivered_time: {type: Date},
        type: {type: String, enum: ["DELIVERY", "PICKUP"]},
        latest_status: {type: String, default: "IN_WAREHOUSE"},
        threat: {type: Number, default: 0},
    },
    {timestamps: true}
);

const Package = mongoose.model("Package", packageSchema);

const PROTO_FILE = "./scripts/threat.proto";

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const pkgDefs = protoLoader.loadSync(PROTO_FILE, options);
let UserService = grpc.loadPackageDefinition(pkgDefs).threat;
const client = new UserService.Threat(process.env.THREAT_SERVER, grpc.credentials.createInsecure());


const updateThreat = async (package_id, threat) => {
    await Package.findByIdAndUpdate(package_id, {threat: threat});
};

(async function main() {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(async () => {
        console.log("Mongoose connected");
    });
    const pkgList = await Package.find({}, "coordinates").lean();

    for await (const pkg of pkgList) {
        const package_id = pkg._id;
        const {latitude, longitude} = pkg.coordinates;

        const req = {
            latitude: latitude,
            longitude: longitude,
        }

        client.startService(req, async (err, response) => {
            console.log(response);
            console.log(err);
            await updateThreat(package_id, response.threat);
            channel.ack(data);
        }); 
    }

    await mongoose.disconnect();
})();