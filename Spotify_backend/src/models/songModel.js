import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
        required: true
    },
    image: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const songModel = mongoose.models.Song || mongoose.model("Song", songSchema);

export default songModel;