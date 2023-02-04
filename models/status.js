import mongoose from "mongoose";
const Schema = mongoose.Schema;

const statusSchema = new Schema(
    {
        status: {
            type: String,
            enum: ["IN WAREHOUSE", "SCANNING", "FORMING CLUSTER", "RIDER ASSIGNED", "PICKED", "DELIVERED"],
            default: "IN WAREHOUSE",
        },
        package_id: {type: Schema.Types.ObjectId, ref: "Package"},
    },
    {timestamps: true}
);

const Status = mongoose.model("Status", statusSchema);
export default Status;
