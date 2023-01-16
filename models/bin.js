import mongoose, {Mongoose} from "mongoose";
const Schema = mongoose.Schema;

const binSchema = new Schema(
    {
        dimensions: {
            length: {type: String, required: true},
            breadth: {type: String, required: true},
            height: {type: String, required: true},
            weight: {type: String, required: true},
        },
        packages: [
            {
                package_id: {type: Schema.Types.ObjectId},
                length: {type: String, required: true},
                breadth: {type: String, required: true},
                height: {type: String, required: true},
                x: {type: String, required: true},
                y: {type: String, required: true},
                z: {type: String, required: true},
                weight: {type: String, required: true},
            },
        ],
    },
    {timestamps: true}
);

const Bin = mongoose.model("Bin", binSchema);
export default Bin;
