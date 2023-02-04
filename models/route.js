import mongoose from "mongoose";
const Schema = mongoose.Schema;

const routeSchema = new Schema(
    {
        rider_id: {type: Schema.Types.ObjectId, ref: "Rider", default: null, index: true},
        paths: [{type: Schema.Types.ObjectId, ref: "Package"}],
        bin_id: {type: Schema.Types.ObjectId, ref: "Bin", index: true},
    },
    {timestamps: true}
);

const Route = mongoose.model("Route", routeSchema);
export default Route;
