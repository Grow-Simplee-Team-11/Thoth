import mongoose from "mongoose";
const Schema = mongoose.Schema;

const packageSchema = new Schema(
    {
        image_url: {type: String},
        item_id: {type: Schema.Types.ObjectId, required: true},
        deliver_to:{name:{type:String,required:true},phone_number:{type:String,required:true}},
        status: {type: String, enum: ['CREATED', 'DELIVERED', 'PICKED', 'FAKE_ATTEMPT', 'DAMAGED'], default: "CREATED"},
        coordinates: {
            latitude: {type: Number, required: true},
            longitude: {type: Number, required: true},
            address: {type: String, required: true},
        },
        rider_id: {type: Schema.Types.ObjectId},
        delivered_time: {type: Date},
        type: {type: String, enum: ['DELIVERY', 'PICKUP']},
    },
    {timestamps: true}
);

const Package = mongoose.model("Package", packageSchema);
export default Package;
