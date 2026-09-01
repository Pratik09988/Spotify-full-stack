import { v2 as cloudinary } from "cloudinary";
import albumModel from "../models/albumModel.js";

const addAlbum = async (req, res) => {
    try {
        console.log("ALBUM FILE:", req.file);
        console.log("ALBUM BODY:", req.body);
        const { name, desc, bgColour } = req.body;
        if (!name || !desc || !bgColour) {
            return res.json({
                success: false,
                message: "Name, description and background colour are required"
            });
        }

        if (!req.file) {
            return res.json({
                success: false,
                message: "Album image is required"
            });
        }

        const imageFile = req.file;
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image"
        });

        const albumData = {
            name,
            desc,
            bgColour,
            image: imageUpload.secure_url
        };

        const album = new albumModel(albumData);
        await album.save();

        res.json({
            success: true,
            message: "Album Added",
            album
        });
    } catch (error) {
        console.log("ADD ALBUM ERROR:", error);

        res.json({
            success: false,
            message: error.message
        });
    }
};

const listAlbum = async (req, res) => {
    try {
        const allAlbums = await albumModel.find({}).sort({ _id: -1 });
        res.json({
            success: true,
            albums: allAlbums
        });
    } catch (error) {
        console.log("LIST ALBUM ERROR:", error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

const removeAlbum = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.json({
                success: false,
                message: "Album ID is required"
            });
        }
        const deletedAlbum = await albumModel.findByIdAndDelete(id);

        if (!deletedAlbum) {
            return res.json({
                success: false,
                message: "Album not found"
            });
        }

        res.json({
            success: true,
            message: "Album removed"
        });
    } catch (error) {
        console.log("REMOVE ALBUM ERROR:", error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

export { addAlbum, listAlbum, removeAlbum };