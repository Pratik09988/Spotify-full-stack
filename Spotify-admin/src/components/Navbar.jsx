import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faRightFromBracket, faEye, faEyeSlash, faPen, faLock, faCheck, faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
    const navigate = useNavigate();
    const profileRef = useRef(null);
    const admin = JSON.parse(localStorage.getItem("admin"));
    const [showProfile, setShowProfile] = useState(false);
    const [username, setUsername] = useState(admin?.username || "");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [oldPasswordVerified, setOldPasswordVerified] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("admin");
        navigate("/login", { replace: true });
    };

    const updateUsername = async () => {
        if (!username.trim()) {
            alert("Username cannot be empty");
            return;
        }
        if (!admin?.id) {
            alert("Admin session not found");
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post("http://localhost:4000/api/admin/update-username", {
                id: admin.id,
                username: username.trim()
            });
            if (response.data.success) {
                localStorage.setItem("admin", JSON.stringify(response.data.admin));
                alert("Username updated successfully");
                window.location.reload();
            } else {
                alert(response.data.message || "Username update failed");
            }
        } catch (error) {
            console.log("UPDATE USERNAME ERROR:", error);
            alert(error.response?.data?.message || "Username update failed");
        } finally {
            setLoading(false);
        }
    };

    const verifyOldPassword = async () => {
        if (!oldPassword.trim()) {
            alert("Please enter your old password");
            return;
        }
        if (!admin?.id) {
            alert("Admin session not found");
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post("http://localhost:4000/api/admin/verify-password", {
                id: admin.id,
                oldPassword: oldPassword
            });
            if (response.data.success) {
                setOldPasswordVerified(true);
                alert("Old password verified. Now enter your new password.");
            } else {
                setOldPasswordVerified(false);
                alert(response.data.message || "Invalid old password");
            }
        } catch (error) {
            console.log("VERIFY PASSWORD ERROR:", error);
            setOldPasswordVerified(false);
            alert(error.response?.data?.message || "Password verification failed");
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () => {
        if (!oldPasswordVerified) {
            alert("Please verify your old password first");
            return;
        }
        if (!newPassword.trim()) {
            alert("Please enter a new password");
            return;
        }
        if (newPassword.trim().length < 6) {
            alert("New password must be at least 6 characters");
            return;
        }
        if (!username.trim()) {
            alert("Username cannot be empty");
            return;
        }
        if (!admin?.id) {
            alert("Admin session not found");
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post("http://localhost:4000/api/admin/update-password", {
                id: admin.id,
                username: username.trim(),
                oldPassword: oldPassword,
                newPassword: newPassword.trim()
            });
            if (response.data.success) {
                alert("Profile updated successfully. Please login again.");
                localStorage.removeItem("admin");
                navigate("/login", { replace: true });
            } else {
                alert(response.data.message || "Profile update failed");
            }
        } catch (error) {
            console.log("UPDATE PASSWORD ERROR:", error);
            alert(error.response?.data?.message || "Profile update failed");
        } finally {
            setLoading(false);
        }
    };
    const adminName = admin?.username || "Admin";
    const firstLetter = adminName.charAt(0).toUpperCase();
    return (
        <header className="relative z-[100] w-full bg-gradient-to-r from-[#F5F1E8] via-[#EAF2E5] to-[#DCECDD] border-b border-[#D8D8C8]">
            <div className="w-full px-3 sm:px-5 md:px-7 lg:px-10 py-3 sm:py-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-[#1549b9] text-lg sm:text-2xl md:text-3xl font-bold leading-tight truncate">Admin Panel</h1>
                        <p className="text-[#334155] text-[10px] sm:text-xs md:text-sm mt-1 truncate">Welcome back, admin!</p>
                    </div>
                    <div ref={profileRef} className="relative shrink-0">
                        <button type="button" onClick={() => setShowProfile((prev) => !prev)} className="group h-11 sm:h-14 md:h-[68px] w-[145px] xs:w-[160px] sm:w-[210px] md:w-[270px] lg:w-[280px] bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md border border-[#E2E2D8] overflow-hidden flex items-center cursor-pointer text-left transition-all duration-200">
                            <div className="h-full w-11 sm:w-14 md:w-[68px] bg-[#063B1A] flex items-center justify-center text-white shrink-0" style={{ clipPath: "polygon(0 0, 100% 0, 82% 100%, 0 100%)" }}>
                                <FontAwesomeIcon icon={faUser} className="text-sm sm:text-base md:text-xl" />
                            </div>
                            <div className="flex-1 min-w-0 px-2 sm:px-3">
                                <p className="text-[#173C27] font-bold text-[10px] sm:text-sm md:text-base leading-tight truncate">ADMIN</p>
                                <p className="text-[#718477] text-[8px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 truncate">Spotify Administrator</p>
                            </div>
                            <div className="w-7 sm:w-9 md:w-10 h-7 sm:h-9 mr-1 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center text-[#063B1A] transition">
                                <FontAwesomeIcon icon={faChevronDown} className={`text-xs sm:text-base md:text-lg transition-transform duration-300 ${showProfile ? "rotate-180" : ""}`} />
                            </div>
                        </button>
                        {showProfile && (
                            <div className="absolute right-0 top-[50px] sm:top-[65px] md:top-[78px] z-[999] w-[calc(100vw-20px)] max-w-[360px] sm:w-[350px] bg-white rounded-xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-[#E2E2D8] overflow-hidden">
                                <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3 border-b border-[#E8E8E8] bg-[#FCFCF9]">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#063B1A] flex items-center justify-center text-white text-base sm:text-lg font-bold shrink-0">{firstLetter}</div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-[#173C27] text-sm sm:text-lg truncate">{adminName}</p>
                                        <p className="text-[#718477] text-[9px] sm:text-xs mt-0.5 truncate">Spotify Administrator</p>
                                    </div>
                                    <button type="button" onClick={() => setShowProfile(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#718477] hover:bg-[#EEF3ED] hover:text-[#173C27] transition shrink-0">
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>
                                <div className="p-4 sm:p-5 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
                                    <div>
                                        <label className="block text-xs font-medium text-[#718477] mb-1.5">Username</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 min-w-0">
                                                <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718477] text-sm" />
                                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} className="w-full h-10 bg-white border border-[#D8D8C8] rounded-lg pl-9 pr-3 text-sm text-[#173C27] outline-none focus:border-[#063B1A] focus:ring-2 focus:ring-[#063B1A]/10 disabled:bg-gray-100" />
                                            </div>
                                            <button type="button" onClick={updateUsername} disabled={loading} className="w-10 h-10 shrink-0 bg-[#063B1A] hover:bg-[#0B4A23] text-white rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed">
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[#718477] mb-1.5">Old Password</label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="relative flex-1 min-w-0">
                                                <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718477] text-sm" />
                                                <input type={showOldPassword ? "text" : "password"} value={oldPassword} onChange={(e) => { setOldPassword(e.target.value); setOldPasswordVerified(false); }} placeholder="Old password" disabled={loading} className="w-full h-10 border border-[#D8D8C8] rounded-lg pl-9 pr-10 text-sm text-[#173C27] outline-none focus:border-[#063B1A] focus:ring-2 focus:ring-[#063B1A]/10 disabled:bg-gray-100" />
                                                <button type="button" onClick={() => setShowOldPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718477] hover:text-[#063B1A] cursor-pointer">
                                                    <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                            <button type="button" onClick={verifyOldPassword} disabled={loading} className="w-full sm:w-auto min-w-[85px] h-10 px-4 bg-[#063B1A] hover:bg-[#0B4A23] text-white text-xs font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                                                {loading ? "..." : "Verify"}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[#718477] mb-1.5">New Password</label>
                                        <div className="relative">
                                            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718477] text-sm" />
                                            <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={!oldPasswordVerified || loading} placeholder={oldPasswordVerified ? "New password" : "Verify old password first"} className={`w-full h-10 border rounded-lg pl-9 pr-10 text-sm outline-none ${oldPasswordVerified ? "bg-white border-[#D8D8C8] text-[#173C27] focus:border-[#063B1A] focus:ring-2 focus:ring-[#063B1A]/10" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`} />
                                            <button type="button" disabled={!oldPasswordVerified || loading} onClick={() => setShowNewPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718477] hover:text-[#063B1A] disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer">
                                                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                            </button>
                                        </div>
                                    </div>
                                    <button type="button" onClick={updatePassword} disabled={!oldPasswordVerified || loading} className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#063B1A] hover:bg-[#0B4A23] text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                                        <FontAwesomeIcon icon={faPen} />
                                        <span>{loading ? "Updating..." : "Update Password"}</span>
                                    </button>
                                    <button type="button" onClick={handleLogout} className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#4A2923] hover:bg-[#59332C] text-[#FFB0A8] text-sm font-medium transition cursor-pointer">
                                        <FontAwesomeIcon icon={faRightFromBracket} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;