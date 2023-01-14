import mongoose from "mongoose";
const Schema = mongoose.Schema;

const packageSchema = new Schema(
    {
        image_url: {type: String, required: true},
        item_id: {type: String, required: true},
        deliver_to:{name:{type:String,required:true},number:{type:String,required:true}},
        status: {type: String, enum: ['CREATED', 'DELIVERED', 'PICKED', 'FAKE_ATTEMPT', 'DAMAGED'], default: "CREATED"},
        coordinates: {
            lat: {type: Number, required: true},
            long: {type: Number, required: true},
            address: {type: String, required: true},
        },
        rider_assigned: {type: String},
        delivered_time: {type: Date, default: Date.now},
        type: {type: String, enum: ['DELIVERY', 'PICKUP']},
    },
    {timestamps: true}
);

const Package = mongoose.model("Package", packageSchema);
export default Package;
