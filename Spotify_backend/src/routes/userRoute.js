import express from "express";
import { registerUser, loginUser, updateUser, updatePassword, addFavorite, removeFavorite, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, getUserStats, deleteUser, listUsers, blockUser, unblockUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/update", updateUser);
userRouter.post("/update-password", updatePassword);
userRouter.post("/favorite/add", addFavorite);
userRouter.post("/favorite/remove", removeFavorite);
userRouter.post("/playlist/create", createPlaylist);
userRouter.post("/playlist/add", addToPlaylist);
userRouter.post("/playlist/remove", removeFromPlaylist);
userRouter.post("/playlist/delete", deletePlaylist);
userRouter.get("/stats", getUserStats);
userRouter.get("/list", listUsers);
userRouter.post("/block", blockUser);
userRouter.post("/unblock", unblockUser);
userRouter.delete("/delete/:id", deleteUser);

export default userRouter;