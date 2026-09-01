import Admin from "../models/AdminModel.js";

const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.json({
                success: false,
                message: "Invalid username or password"
            });
        }

        if (admin.password !== password) {
            return res.json({
                success: false,
                message: "Invalid username or password"
            });
        }

        return res.json({
            success: true,
            message: "Login successful",
            admin: {
                id: admin._id,
                username: admin.username
            }
        });
    } catch (error) {
        console.log("Admin Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const verifyAdminPassword = async (req, res) => {
    try {
        const { id, oldPassword } = req.body;

        if (!id || !oldPassword) {
            return res.json({
                success: false,
                message: "Old password is required"
            });
        }

        const admin = await Admin.findById(id);

        if (!admin) {
            return res.json({
                success: false,
                message: "Admin not found"
            });
        }

        if (admin.password !== oldPassword) {
            return res.json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        return res.json({
            success: true,
            message: "Password verified successfully"
        });
    } catch (error) {
        console.log("Verify Password Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateAdminUsername = async (req, res) => {
    try {
        const { id, username } = req.body;

        if (!id || !username || !username.trim()) {
            return res.json({
                success: false,
                message: "Username is required"
            });
        }

        const existingAdmin = await Admin.findOne({
            username: username.trim(),
            _id: { $ne: id }
        });

        if (existingAdmin) {
            return res.json({
                success: false,
                message: "Username already exists"
            });
        }

        const admin = await Admin.findByIdAndUpdate(
            id,
            { username: username.trim() },
            { new: true }
        );

        if (!admin) {
            return res.json({
                success: false,
                message: "Admin not found"
            });
        }

        return res.json({
            success: true,
            message: "Username updated successfully",
            admin: {
                id: admin._id,
                username: admin.username
            }
        });
    } catch (error) {
        console.log("Username Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateAdminPassword = async (req, res) => {
    try {
        const { id, username, oldPassword, newPassword } = req.body;

        if (!id || !oldPassword || !newPassword) {
            return res.json({
                success: false,
                message: "All password fields are required"
            });
        }

        const admin = await Admin.findById(id);

        if (!admin) {
            return res.json({
                success: false,
                message: "Admin not found"
            });
        }

        if (admin.password !== oldPassword) {
            return res.json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        if (username && username.trim()) {
            const existingAdmin = await Admin.findOne({
                username: username.trim(),
                _id: { $ne: id }
            });

            if (existingAdmin) {
                return res.json({
                    success: false,
                    message: "Username already exists"
                });
            }

            admin.username = username.trim();
        }

        admin.password = newPassword.trim();
        await admin.save();
        return res.json({
            success: true,
            message: "Profile updated successfully",
            admin: {
                id: admin._id,
                username: admin.username
            }
        });
    } catch (error) {
        console.log("Password Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export { adminLogin, verifyAdminPassword, updateAdminUsername, updateAdminPassword };