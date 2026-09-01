import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import artistModel from "../models/artistModel.js";

const addSong = async (req, res) => {
    try {
        console.log(req.files);
        console.log(req.body);
        const name = req.body.name;
        const desc = req.body.desc;
        const album = req.body.album || "none";
        const artist = req.body.artist || "none";
        const audio = req.files.audio[0];
        const image = req.files.image[0];
        const audioUpload = await cloudinary.uploader.upload(audio.path, {resource_type: "video"});
        const imageUpload = await cloudinary.uploader.upload(image.path, {resource_type: "image"});
        const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60).toString().padStart(2, "0")}`;
        const songData = { name, desc, album, artist, image: imageUpload.secure_url, file: audioUpload.secure_url, duration };
        const song = new songModel(songData);
        await song.save();
        res.json({
            success: true,
            message: "Song Added"
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

const listSong = async (req, res) => {
    try {
        const allSongs = await songModel.find({});
        res.json({
            success: true,
            songs: allSongs
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

const removeSong = async (req, res) => {
    try {
        await songModel.findByIdAndDelete(req.body.id);
        res.json({
            success: true,
            message: "Song removed"
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Some Error"
        });
    }
};
const searchSong = async (req, res) => {
    try {
        const query = req.query.query || "";
        if (!query.trim()) {
            return res.json({
                success: true,
                songs: [],
                albums: [],
                artists: []
            });
        }
        const searchQuery = query.trim();
        const songSearch = await songModel.find({
            $or: [
                {
                    name: {
                        $regex: searchQuery,
                        $options: "i"
                    }
                },
                {
                    desc: {
                        $regex: searchQuery,
                        $options: "i"
                    }
                }
            ]
        }).populate("artist");
        const albumSearch = await albumModel.find({
            $or: [
                {
                    name: {
                        $regex: searchQuery,
                        $options: "i"
                    }
                },
                {
                    desc: {
                        $regex: searchQuery,
                        $options: "i"
                    }
                }
            ]
        });
        const artistSearch = await artistModel.find({
            $or: [
                {
                    name: {
                        $regex: searchQuery,
                        $options: "i"
                    }
                },
                {
                    desc: {
                        $regex: searchQuery,
                        $options: "i"
                    }
                }
            ]
        });
        res.json({
            success: true,
            songs: songSearch,
            albums: albumSearch,
            artists: artistSearch
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Search failed"
        });
    }
};
export {
    addSong,
    listSong,
    removeSong,
    searchSong
};