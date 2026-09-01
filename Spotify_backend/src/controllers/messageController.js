import mongoose from "mongoose";
import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";

const replaceUserMention = (message, userName) => {
    return message
        .replace(/@user\b/gi, userName)
        .trim();
};

const sendMessage = async (req, res) => {
    try {
        const {
            userId,
            message
        } = req.body;

        if (!userId || !message?.trim()) {
            return res.json({
                success: false,
                message: "User ID and message are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const finalMessage = replaceUserMention(message.trim(), user.name);

        const newMessage = await messageModel.create({
            sender: "admin",
            receiver: userId,
            message: finalMessage,
            isBroadcast: false,
            isRead: false
        });

        return res.json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        console.log("SEND MESSAGE ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const sendMessageToAll = async (req, res) => {
    try {
        const {
            message
        } = req.body;

        if (!message?.trim()) {
            return res.json({
                success: false,
                message: "Message is required"
            });
        }

        const users = await userModel
            .find({})
            .select("_id name");

        if (!users || users.length === 0) {
            return res.json({
                success: false,
                message: "No users found"
            });
        }

        const messages = users.map((user) => {
            const finalMessage = replaceUserMention(message.trim(), user.name);

            return {
                sender: "admin",
                receiver: user._id,
                message: finalMessage,
                isBroadcast: true,
                isRead: false
            };
        });

        const createdMessages = await messageModel.insertMany(messages);

        return res.json({
            success: true,
            message: `Message sent to all ${users.length} users`,
            count: createdMessages.length
        });
    } catch (error) {
        console.log("SEND MESSAGE TO ALL ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const getUserMessages = async (req, res) => {
    try {
        const {
            userId
        } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const messages = await messageModel
            .find({
                receiver: userId
            })
            .sort({
                createdAt: -1
            });

        return res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.log("GET USER MESSAGES ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const deleteUserNotifications = async (req, res) => {
    try {
        const {
            userId
        } = req.body;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const result = await messageModel.deleteMany({
            receiver: userId
        });

        return res.json({
            success: true,
            message: "Notifications removed successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.log("DELETE USER NOTIFICATIONS ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

export { sendMessage,sendMessageToAll,getUserMessages,deleteUserNotifications};