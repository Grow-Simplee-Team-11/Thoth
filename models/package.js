import mongoose from "mongoose";
const Schema = mongoose.Schema;

const packageSchema = new Schema(
    {
        image_url: {type: String, required: true},
        dimensions: {
            height: {type: Number, required: true},
            length: {type: Number, required: true},
            breadth: {type: Number, required: true},
        },
        sku_id: {type: String, require: true},
        deliver_to:{name:{type:String,required:true},number:{type:String,required:true}},
        delivery_status: {type: String, default: "CREATED"},
        coordinates: {
            lat: {type: Number, required: true},
            long: {type: Number, required: true},
            address: {type: String, required: true},
        },
        rider_assigned: {type: String},
        delivered_time: {type: Date, default: Date.now},
    },
    {timestamps: true}
);

const Package = mongoose.model("Package", packageSchema);
export default Package;
