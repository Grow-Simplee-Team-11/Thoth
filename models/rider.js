import mongoose from "mongoose";
const Schema = mongoose.Schema;

const riderSchema = new Schema(
    {
        name: {type: String, required: true},
        phone: {type: String, required: true},
        email: {type: String, required: true},
        route_id: {type: Schema.Types.ObjectId},
    },
    {timestamps: true}
);

const Rider = mongoose.model("Rider", riderSchema);
export default Rider;
