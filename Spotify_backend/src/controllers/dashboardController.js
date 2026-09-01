import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import artistModel from "../models/artistModel.js";
import userModel from "../models/userModel.js";

const getDashboardData = async (req, res) => {
    try {
        const totalSongs = await songModel.countDocuments();
        const totalAlbums = await albumModel.countDocuments();
        const totalArtists = await artistModel.countDocuments();
        const totalUsers = await userModel.countDocuments();
        const recentUsers = await userModel.find({}).select("name email createdAt").sort({ _id: -1 }).limit(4);
        const recentSongs = await songModel.find({}).select("name image album artist createdAt").populate("artist", "name").sort({ _id: -1 }).limit(4);
        const recentAlbumsData = await albumModel.find({}).select("name desc image bgColour createdAt").sort({ _id: -1 }).limit(4);

        const recentAlbums = recentAlbumsData.map((album) => {
            let createdAt = album.createdAt;
            if (!createdAt && album._id) {
                createdAt = album._id.getTimestamp();
            }

            return {
                _id: album._id,
                name: album.name,
                desc: album.desc,
                image: album.image,
                bgColour: album.bgColour,
                createdAt
            };
        });

        const songs = await songModel.find({}).select("artist");
        const artistCountMap = {};

        songs.forEach((song) => {
            if (song.artist) {
                const artistId = song.artist.toString();
                if (!artistCountMap[artistId]) {
                    artistCountMap[artistId] = 0;
                }
                artistCountMap[artistId]++;
            }
        });

        const artists = await artistModel.find({}).select("name image createdAt").sort({ _id: -1 }).limit(4);
        const recentArtists = artists.map((artist) => {
            let createdAt = artist.createdAt;
            if (!createdAt && artist._id) {
                createdAt = artist._id.getTimestamp();
            }
            return {
                _id: artist._id,
                name: artist.name,
                image: artist.image,
                songCount: artistCountMap[artist._id.toString()] || 0,
                createdAt
            };
        });
        res.json({
            success: true,
            data: {
                counts: {
                    songs: totalSongs,
                    albums: totalAlbums,
                    artists: totalArtists,
                    users: totalUsers
                },
                recentUsers,
                recentSongs,
                recentAlbums,
                topArtists: recentArtists
            }
        });
    } catch (error) {
        console.log("DASHBOARD ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load dashboard data"
        });
    }
};
export { getDashboardData };