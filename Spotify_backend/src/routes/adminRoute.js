import express from "express";
import { adminLogin, verifyAdminPassword, updateAdminUsername, updateAdminPassword } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.post("/verify-password", verifyAdminPassword);
adminRouter.post("/update-username", updateAdminUsername);
adminRouter.post("/update-password", updateAdminPassword);

export default adminRouter;