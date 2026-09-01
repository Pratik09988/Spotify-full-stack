import bcrypt from "bcrypt";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";

const registerUser = async (req, res) => {
    try {
        let {
            name,
            email,
            mobile,
            gender,
            password
        } = req.body;

        name = name?.trim();
        email = email?.trim().toLowerCase();
        mobile = mobile?.trim();
        gender = gender?.trim().toLowerCase();
        password = password?.trim();

        if (!name || !email || !mobile || !gender || !password) {
            return res.json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!["male", "female"].includes(gender)) {
            return res.json({
                success: false,
                message: "Please select a valid gender"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        if (!/^\d{10}$/.test(mobile)) {
            return res.json({
                success: false,
                message: "Mobile number must contain exactly 10 digits"
            });
        }

        const emailExists = await userModel.findOne({
            email
        });

        if (emailExists) {
            return res.json({
                success: false,
                message: "Email already registered"
            });
        }

        const mobileExists = await userModel.findOne({
            mobile
        });

        if (mobileExists) {
            return res.json({
                success: false,
                message: "Mobile number already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            email,
            mobile,
            gender,
            password: hashedPassword,
            favorites: [],
            library: [],
            isBlocked: false,
            blockedUntil: null,
            blockDuration: null
        });

        return res.json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                gender: user.gender,
                favorites: user.favorites || [],
                library: user.library || []
            }
        });
    } catch (error) {
        console.log("REGISTER ERROR:", error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];

            if (duplicateField === "email") {
                return res.json({
                    success: false,
                    message: "Email already registered"
                });
            }

            if (duplicateField === "mobile") {
                return res.json({
                    success: false,
                    message: "Mobile number already registered"
                });
            }

            return res.json({
                success: false,
                message: "Email or mobile number already registered"
            });
        }

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        let {
            mobile,
            password
        } = req.body;

        mobile = mobile?.trim();
        password = password?.trim();

        if (!mobile || !password) {
            return res.json({
                success: false,
                message: "Mobile number and password are required"
            });
        }

        const user = await userModel.findOne({
            mobile
        });

        if (!user) {
            return res.json({
                success: false,
                message: "Invalid mobile number or password"
            });
        }

        if (user.isBlocked) {
            if (user.blockDuration === "permanent" || !user.blockedUntil) {
                return res.json({
                    success: false,
                    blocked: true,
                    blockType: "permanent",
                    message: "Your account is permanently blocked."
                });
            }

            const now = new Date();

            if (user.blockedUntil <= now) {
                user.isBlocked = false;
                user.blockedUntil = null;
                user.blockDuration = null;

                await user.save();
            } else {
                const remainingMilliseconds = user.blockedUntil.getTime() - now.getTime();
                const remainingDays = Math.ceil(remainingMilliseconds / (1000 * 60 * 60 * 24));

                return res.json({
                    success: false,
                    blocked: true,
                    blockType: "temporary",
                    blockDuration: user.blockDuration,
                    blockedUntil: user.blockedUntil,
                    remainingDays,
                    message: `Your account is blocked. ${remainingDays} day${remainingDays !== 1 ? "s" : ""} remaining.`
                });
            }
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.json({
                success: false,
                message: "Invalid mobile number or password"
            });
        }

        return res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                gender: user.gender,
                favorites: user.favorites || [],
                library: user.library || []
            }
        });
    } catch (error) {
        console.log("LOGIN ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const listUsers = async (req, res) => {
    try {
        const users = await userModel
            .find({})
            .select("name email mobile gender isBlocked blockedUntil blockDuration")
            .sort({
                name: 1
            })
            .lean();

        return res.json({
            success: true,
            users: users.map((user) => ({
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                gender: user.gender,
                isBlocked: user.isBlocked || false,
                blockedUntil: user.blockedUntil || null,
                blockDuration: user.blockDuration || null
            }))
        });
    } catch (error) {
        console.log("LIST USERS ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const getUserStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments({});

        return res.json({
            success: true,
            totalUsers
        });
    } catch (error) {
        console.log("GET USER STATS ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.json({
                success: false,
                message: "User ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const user = await userModel.findById(id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        await userModel.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: "User removed successfully"
        });
    } catch (error) {
        console.log("DELETE USER ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const blockUser = async (req, res) => {
    try {
        const {
            userId,
            duration
        } = req.body;

        if (!userId || !duration) {
            return res.json({
                success: false,
                message: "User ID and duration are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (duration === "permanent") {
            user.isBlocked = true;
            user.blockedUntil = null;
            user.blockDuration = "permanent";

            await user.save();

            return res.json({
                success: true,
                message: "User blocked permanently",
                blockDuration: "permanent",
                blockedUntil: null
            });
        }

        const days = Number(duration);

        if (![7, 30].includes(days)) {
            return res.json({
                success: false,
                message: "Invalid block duration"
            });
        }

        const blockedUntil = new Date();

        blockedUntil.setDate(
            blockedUntil.getDate() + days
        );

        user.isBlocked = true;
        user.blockedUntil = blockedUntil;
        user.blockDuration = `${days} days`;

        await user.save();

        return res.json({
            success: true,
            message: `User blocked for ${days} days`,
            blockedUntil,
            blockDuration: `${days} days`
        });
    } catch (error) {
        console.log("BLOCK USER ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const unblockUser = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({
                success: false,
                message: "User ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        user.isBlocked = false;
        user.blockedUntil = null;
        user.blockDuration = null;

        await user.save();

        return res.json({
            success: true,
            message: "User unblocked successfully"
        });
    } catch (error) {
        console.log("UNBLOCK USER ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        let {
            id,
            name,
            email,
            mobile,
            gender
        } = req.body;

        name = name?.trim();
        email = email?.trim().toLowerCase();
        mobile = mobile?.trim();
        gender = gender?.trim().toLowerCase();

        if (!id) {
            return res.json({
                success: false,
                message: "User ID is required"
            });
        }

        if (!name || !email || !mobile || !gender) {
            return res.json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const emailUser = await userModel.findOne({
            email,
            _id: { $ne: id }
        });

        if (emailUser) {
            return res.json({
                success: false,
                message: "Email already registered"
            });
        }

        const mobileUser = await userModel.findOne({
            mobile,
            _id: { $ne: id }
        });

        if (mobileUser) {
            return res.json({
                success: false,
                message: "Mobile number already registered"
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            {
                name,
                email,
                mobile,
                gender
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                gender: updatedUser.gender,
                favorites: updatedUser.favorites || [],
                library: updatedUser.library || []
            }
        });
    } catch (error) {
        console.log("UPDATE USER ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const {
            id,
            oldPassword,
            newPassword
        } = req.body;

        if (!id || !oldPassword || !newPassword) {
            return res.json({
                success: false,
                message: "All fields are required"
            });
        }

        const user = await userModel.findById(id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const correct = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!correct) {
            return res.json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        user.password = await bcrypt.hash(
            newPassword,
            10
        );

        await user.save();

        return res.json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.log("PASSWORD ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const addFavorite = async (req, res) => {
    try {
        const {
            userId,
            songId
        } = req.body;

        if (!userId || !songId) {
            return res.json({
                success: false,
                message: "User ID and Song ID are required"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (!Array.isArray(user.favorites)) {
            user.favorites = [];
        }

        const alreadyFavorite = user.favorites.some(
            id =>
                id.toString() ===
                songId.toString()
        );

        if (alreadyFavorite) {
            return res.json({
                success: true,
                message: "Song is already in favorites",
                favorites: user.favorites
            });
        }

        user.favorites.push(songId);

        await user.save();

        return res.json({
            success: true,
            message: "Song added to favorites",
            favorites: user.favorites
        });
    } catch (error) {
        console.log("ADD FAVORITE ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const {
            userId,
            songId
        } = req.body;

        if (!userId || !songId) {
            return res.json({
                success: false,
                message: "User ID and Song ID are required"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (!Array.isArray(user.favorites)) {
            user.favorites = [];
        }

        user.favorites = user.favorites.filter(
            id =>
                id.toString() !==
                songId.toString()
        );

        await user.save();

        return res.json({
            success: true,
            message: "Song removed from favorites",
            favorites: user.favorites
        });
    } catch (error) {
        console.log("REMOVE FAVORITE ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const createPlaylist = async (req, res) => {
    try {
        const {
            userId,
            name
        } = req.body;

        if (!userId || !name?.trim()) {
            return res.json({
                success: false,
                message: "Playlist name is required"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        user.library.push({
            name: name.trim(),
            songs: []
        });

        await user.save();

        return res.json({
            success: true,
            message: "Playlist created",
            library: user.library
        });
    } catch (error) {
        console.log("CREATE PLAYLIST ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const addToPlaylist = async (req, res) => {
    try {
        const {
            userId,
            playlistId,
            songId
        } = req.body;

        if (!userId || !playlistId || !songId) {
            return res.json({
                success: false,
                message: "Required fields are missing"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const playlist = user.library.id(playlistId);

        if (!playlist) {
            return res.json({
                success: false,
                message: "Playlist not found"
            });
        }

        const exists = playlist.songs.some(
            id =>
                id.toString() ===
                songId.toString()
        );

        if (!exists) {
            playlist.songs.push(songId);
        }

        await user.save();

        return res.json({
            success: true,
            message: exists ? "Song already exists in playlist" : "Song added to playlist",
            library: user.library
        });
    } catch (error) {
        console.log("ADD PLAYLIST SONG ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const removeFromPlaylist = async (req, res) => {
    try {
        const {
            userId,
            playlistId,
            songId
        } = req.body;

        if (!userId || !playlistId || !songId) {
            return res.json({
                success: false,
                message: "Required fields are missing"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const playlist = user.library.id(playlistId);

        if (!playlist) {
            return res.json({
                success: false,
                message: "Playlist not found"
            });
        }

        playlist.songs = playlist.songs.filter(
            id =>
                id.toString() !==
                songId.toString()
        );

        await user.save();

        return res.json({
            success: true,
            message: "Song removed from playlist",
            library: user.library
        });
    } catch (error) {
        console.log("REMOVE PLAYLIST SONG ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

const deletePlaylist = async (req, res) => {
    try {
        const {
            userId,
            playlistId
        } = req.body;

        if (!userId || !playlistId) {
            return res.json({
                success: false,
                message: "User ID and Playlist ID are required"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const playlistIndex = user.library.findIndex(
            playlist =>
                playlist._id.toString() ===
                playlistId.toString()
        );

        if (playlistIndex === -1) {
            return res.json({
                success: false,
                message: "Playlist not found"
            });
        }

        user.library.splice(
            playlistIndex,
            1
        );

        await user.save();

        return res.json({
            success: true,
            message: "Playlist deleted successfully",
            library: user.library
        });
    } catch (error) {
        console.log("DELETE PLAYLIST ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};

export { registerUser, loginUser, updateUser, updatePassword, addFavorite, removeFavorite, createPlaylist, addToPlaylist, removeFromPlaylist, deletePlaylist, getUserStats, deleteUser, listUsers, blockUser, unblockUser };