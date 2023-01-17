import mongoose from "mongoose";
const Schema = mongoose.Schema;

const packageSchema = new Schema(
    {
        image_url: {type: String},
        item_id: {type: String},
        awb_no: {type: String},
        
        deliver_to: {name: {type: String}, phone_number: {type: String}},

        coordinates: {
            latitude: {type: Number},
            longitude: {type: Number},
            address: {type: String},
        },
        dimensions: {
            length: {type: String},
            breadth: {type: String},
            height: {type: String},
            weight: {type: String},
        },
        delivered_time: {type: Date},
        type: {type: String, enum: ["DELIVERY", "PICKUP"]},
    },
    {timestamps: true}
);

const Package = mongoose.model("Package", packageSchema);
export default Package;

/* 
- rider_id - 
- route_id
- package_id
*/

//TODO: change deliver_to,deliver_time name
/*
Wrapper to change format of returned package based on address
[{
    packages:[{package_item}]
    location:{
        latitude:
        longitude:
        address:
    }
}]
*/
