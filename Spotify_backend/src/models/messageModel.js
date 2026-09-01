import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        default: "admin"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isBroadcast: {
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const messageModel = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default messageModel;