import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import "dotenv/config";
import userRouter from "./src/routes/userRoute.js";
import songRouter from "./src/routes/songRoute.js";
import albumRouter from "./src/routes/albumRoute.js";
import artistRouter from "./src/routes/artistRoute.js";
import adminRouter from "./src/routes/adminRoute.js";
import dashboardRouter from "./src/routes/dashboardRoute.js";
import messageRouter from "./src/routes/messageRoute.js";
import connectDB from "./src/config/mongodb.js";
import connectCloudinary from "./src/config/cloudinary.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

app.use(express.json());
app.use(cors());

app.use("/api/song", songRouter);
app.use("/api/album", albumRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/artist", artistRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/message", messageRouter);

app.get("/", (req, res) => {
    res.send("API IS WORKING");
});

app.listen(port, () => {
    console.log(`Server is started on port ${port}`);
});