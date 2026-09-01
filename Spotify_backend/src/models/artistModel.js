import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        desc: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        bgColour: {
            type: String,
            default: "#BF509F"
        }
    },
    {
        timestamps: true
    }
);
const artistModel = mongoose.models.Artist || mongoose.model("Artist", artistSchema);

export default artistModel;