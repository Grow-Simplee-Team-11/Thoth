import mongoose from "mongoose";
const Schema = mongoose.Schema;

const routeSchema = new Schema(
    {
        rider_id: {type: Schema.Types.ObjectId, default: null},
        paths: [Schema.Types.ObjectId],
        bin_id: {type: Schema.Types.ObjectId},
    },
    {timestamps: true}
);

const Route = mongoose.model("Route", routeSchema);
export default Route;
