import { addSong,listSong,removeSong,searchSong } from "../controllers/songController.js";
import express from 'express'
import upload from "../middleware/multer.js";

const songRouter = express.Router();

songRouter.post('/add',upload.fields([{name:'image',maxCount:1},{name:'audio',maxCount:1}]) ,addSong);
songRouter.get('/list',listSong);
songRouter.get('/search',searchSong);
songRouter.post('/remove',removeSong)

export default songRouter
