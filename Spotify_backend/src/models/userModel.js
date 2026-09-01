import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    songs: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Song"
            }
        ],
        default: []
    }
}, {
    _id: true
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"]
    },
    password: {
        type: String,
        required: true
    },
    favorites: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Song"
            }
        ],
        default: []
    },
    library: {
        type: [playlistSchema],
        default: []
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedUntil: {
        type: Date,
        default: null
    },
    blockDuration: {
        type: String,
        enum: ["7 days", "30 days", "permanent", null],
        default: null
    }
}, {
    timestamps: true
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;