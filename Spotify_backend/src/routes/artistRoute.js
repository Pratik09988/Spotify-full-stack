import express from "express";
import {addArtist,listArtist,getArtist,searchArtist,removeArtist} from "../controllers/artistController.js";
import upload from "../middleware/multer.js";

const artistRouter = express.Router();
artistRouter.post("/add", upload.single("image"), addArtist);
artistRouter.get("/list", listArtist);
artistRouter.get("/search", searchArtist);
artistRouter.get("/:id", getArtist);
artistRouter.post("/remove", removeArtist);

export default artistRouter;