import mongoose from "mongoose";
const Schema = mongoose.Schema;

const statusSchema = new Schema(
    {
        status: {
            type: String,
            enum: [
                "IN_WAREHOUSE",
                "IN_SCAN",
                "TAMPER_CHECK",
                "BIN_PACKING",
                "ROUTE_ASSIGNMENT",
                "DRIVER_ASSIGNMENT",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "PICKED",
                "FAKE_ATTEMPT",
            ],
            default: "IN_WAREHOUSE",
        },
        package_id: {type: Schema.Types.ObjectId, ref: "Package"},
    },
    {timestamps: true}
);

const Status = mongoose.model("Status", statusSchema);
export default Status;
