import mongoose from "mongoose";
const Schema = mongoose.Schema;

const itemSchema = new Schema(
    {
        name: {type: String, required: true},
        dimensions: {
            length:{type: String, required: true},
            breadth:{type: String, required: true},
            height:{type: String, required: true},
            weight:{type: String, required: true},
        },
    },
    {timestamps: true}
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
