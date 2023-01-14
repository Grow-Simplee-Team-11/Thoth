import mongoose from "mongoose";
const Schema = mongoose.Schema;

const binSchema = new Schema(
    {
        name: {type: String, required: true},
        phone: {type: String, required: true},
        paths: [Number],
    },
    {timestamps: true}
);

const Bin = mongoose.model("Bin", binSchema);
export default Bin;
