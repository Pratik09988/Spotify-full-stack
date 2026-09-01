import { v2 as cloudinary } from "cloudinary";
import artistModel from "../models/artistModel.js";

const addArtist = async (req, res) => {
    try {
        const name = req.body.name;
        const desc = req.body.desc;
        const bgColour = req.body.bgColour || "#BF509F";
        const imageFile = req.file;

        if (!name || !desc) {
            return res.json({
                success: false,
                message: "Artist name and description are required"
            });
        }
        if (!imageFile) {
            return res.json({
                success: false,
                message: "Artist image is required"
            });
        }
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
        const artistData = {name,desc,bgColour,image: imageUpload.secure_url};
        const artist = new artistModel(artistData);
        await artist.save();
        res.json({
            success: true,
            message: "Artist Added",
            artist
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

const listArtist = async (req, res) => {
    try {
        const allArtists = await artistModel.find({}).sort({
            createdAt: -1
        });
        res.json({
            success: true,
            artists: allArtists
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

const getArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const artist = await artistModel.findById(id);
        if (!artist) {
            return res.json({
                success: false,
                message: "Artist not found"
            });
        }
        res.json({
            success: true,
            artist
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

const searchArtist = async (req, res) => {
    try {
        const query = req.query.query || "";
        if (!query.trim()) {
            return res.json({
                success: true,
                artists: []
            });
        }

        const artists = await artistModel.find({
            name: {
                $regex: query.trim(),
                $options: "i"
            }
        }).sort({
            name: 1
        });
        res.json({
            success: true,
            artists
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

const removeArtist = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.json({
                success: false,
                message: "Artist id is required"
            });
        }
        await artistModel.findByIdAndDelete(id);
        res.json({
            success: true,
            message: "Artist Removed"
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

export {addArtist,listArtist,getArtist,searchArtist,removeArtist};