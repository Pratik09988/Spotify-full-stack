import express from "express";
import { sendMessage, sendMessageToAll, getUserMessages, deleteUserNotifications } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.post("/send", sendMessage);
messageRouter.post("/send-all", sendMessageToAll);
messageRouter.get("/user/:userId", getUserMessages);
messageRouter.delete("/user/notifications", deleteUserNotifications);

export default messageRouter;