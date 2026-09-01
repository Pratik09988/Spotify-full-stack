import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { PlayerContext } from "../context/PlayerContext";

const Profile = () => {
    const navigate = useNavigate();
    const { songsData } = useContext(PlayerContext);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
    const [editing, setEditing] = useState("");
    const [value, setValue] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [editingPassword, setEditingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    if (!user) {
        navigate("/login");
        return null;
    }

    const firstLetter = user.name?.charAt(0).toUpperCase() || "U";

    const favoriteCount = [...new Set((user.favorites || []).map((id) => id?.toString()))].filter((favoriteId) =>
        songsData?.some((song) => song?._id?.toString() === favoriteId)
    ).length;

    const edit = (field) => {
        setEditing(field);
        setValue(field === "password" ? "" : user[field] || "");
    };

    const save = async () => {
        if (editing === "password" && !value.trim()) {
            alert("Enter new password");
            return;
        }
        try {
            const res = await axios.put(
                "https://spotify-backend-lmvw.onrender.com/api/user/update",
                {
                    id: user.id,
                    name: editing === "name" ? value : user.name,
                    email: editing === "email" ? value : user.email,
                    mobile: editing === "mobile" ? value : user.mobile,
                    gender: editing === "gender" ? value : user.gender,
                    password: editing === "password" ? value : undefined
                }
            );
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                setEditing("");
                setValue("");
                setShowPassword(false);
                alert("Profile updated");
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.log(error);
            alert("Update failed");
        }
    };

    const cancel = () => {
        setEditing("");
        setValue("");
        setShowPassword(false);
    };

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const fields = [
        ["name", "user", "Name"],
        ["email", "envelope", "Email"],
        ["mobile", "phone", "Mobile Number"],
        ["gender", "venus-mars", "Gender"]
    ];

    const changePassword = async () => {
        if (!oldPassword || !newPassword) {
            alert("Both passwords are required");
            return;
        }
        try {
            const res = await axios.put(
                "http://localhost:4000/api/user/update-password",
                {
                    id: user.id,
                    oldPassword,
                    newPassword
                }
            );
            if (res.data.success) {
                alert("Password updated successfully");
                setEditingPassword(false);
                setOldPassword("");
                setNewPassword("");
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.log(error);
            alert("Password update failed");
        }
    };

    return (
        <div className="flex-1 h-full overflow-hidden bg-[#121212]">
            <div className="p-4 pb-0">
                <Navbar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            </div>
            <div className="h-[calc(100%-100px)] overflow-y-auto px-4 pb-8">
                <div className="max-w-3xl mx-auto pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-white text-2xl font-bold">
                            My Profile
                        </h1>
                        <button onClick={() => navigate(-1)} className="bg-[#242424] hover:text-green-600 text-white px-4 py-2 rounded-full text-sm">
                            <i className="fa-solid fa-arrow-left mr-2 " />
                            Back
                        </button>
                    </div>
                    <div className="bg-[#181818] rounded-xl p-4 md:p-6">
                        <div className="text-center mb-5">
                            <div className="w-20 h-20 mx-auto rounded-full bg-purple-600 flex items-center justify-center">
                                <span className="text-white text-3xl font-bold">
                                    {firstLetter}
                                </span>
                            </div>
                            <h2 className="text-white text-xl font-bold mt-3">
                                {user.name}
                            </h2>
                            <p className="text-gray-400 text-xs">
                                Manage your Personal Infomation
                            </p>
                        </div>
                        <div className="space-y-2.5">
                            {fields.map(([field, icon, label]) => (
                                <div key={field} className="bg-[#242424] rounded-lg p-3 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-[#333] rounded-full flex items-center justify-center">
                                        <i className={`fa-solid fa-${icon} text-white text-sm`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-400 text-xs">
                                            {label}
                                        </p>
                                        {editing === field ? (
                                            field === "gender" ? (
                                                <select value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-[#181818] text-white text-sm p-1.5 rounded">
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            ) : (
                                                <input type={field === "email" ? "email" : field === "mobile" ? "tel" : "text"} value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-[#181818] text-white text-sm p-1.5 rounded outline-none" />
                                            )
                                        ) : (
                                            <p className="text-white text-sm capitalize">
                                                {user[field]}
                                            </p>
                                        )}
                                    </div>
                                    {editing === field ? (
                                        <div className="flex gap-1">
                                            <button onClick={save} className="w-8 h-8 rounded-full bg-green-600">
                                                <i className="fa-solid fa-check text-xs" />
                                            </button>
                                            <button onClick={cancel} className="w-8 h-8 rounded-full bg-red-600">
                                                <i className="fa-solid fa-xmark text-xs" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => edit(field)} className="text-gray-400 hover:text-white">
                                            <i className="fa-solid fa-pencil text-xs" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div className="bg-[#242424] rounded-lg p-3 flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#333] rounded-full flex items-center justify-center">
                                    <i className="fa-solid fa-lock text-white text-sm"></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs">
                                        Password
                                    </p>
                                    {!editingPassword ? (
                                        <p className="text-white text-sm tracking-widest">
                                            ••••••••••
                                        </p>
                                    ) : (
                                        <div className="space-y-2 mt-1">
                                            <input type="password" placeholder="Old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full bg-[#181818] text-white text-sm p-2 rounded outline-none" />
                                            <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#181818] text-white text-sm p-2 rounded outline-none" />
                                        </div>
                                    )}
                                </div>
                                {editingPassword ? (
                                    <div className="flex gap-2">
                                        <button onClick={changePassword} className="text-green-500">
                                            <i className="fa-solid fa-check"></i>
                                        </button>
                                        <button onClick={() => { setEditingPassword(false); setOldPassword(""); setNewPassword(""); }} className="text-red-500">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setEditingPassword(true)} className="text-gray-400 hover:text-white">
                                        <i className="fa-solid fa-pencil text-sm"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-5">
                            <button onClick={() => {
                                const playlists = user.library || [];
                                if (playlists.length === 0) {
                                    alert("You have not created any playlist yet.");
                                    return;
                                }
                                const randomIndex = Math.floor(Math.random() * playlists.length);
                                const randomPlaylist = playlists[randomIndex];navigate(`/playlist/${randomPlaylist._id}`);}} className="bg-[#242424] hover:bg-[#303030] rounded-lg p-4 transition cursor-pointer">
                                <i className="fa-solid fa-music text-white" />
                                <h3 className="text-white text-lg font-bold">
                                    {user.library?.length || 0}
                                </h3>
                                <p className="text-white text-xs">
                                    Playlists
                                </p>
                            </button>
                            <button onClick={() => navigate("/favorites")} className="bg-[#242424] hover:bg-[#303030] rounded-lg p-4">
                                <i className="fa-solid fa-heart text-white" />
                                <h3 className="text-white text-lg font-bold">
                                    {favoriteCount}
                                </h3>
                                <p className="text-white text-xs">
                                    Favorite
                                </p>
                            </button>
                        </div>
                        <button onClick={logout} className="w-full mt-5 bg-red-600 hover:bg-red-500 py-2.5 rounded-full text-sm font-semibold"><i className="fa-solid fa-right-from-bracket mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
