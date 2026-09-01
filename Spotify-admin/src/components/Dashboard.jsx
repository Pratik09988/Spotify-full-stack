import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faCompactDisc, faMicrophone, faUsers, faPaperPlane, faUser } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { url } from "../App";

const Dashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const response = await axios.get(`${url}/api/dashboard`);

            if (response.data.success) {
                setDashboardData(response.data.data);
            } else {
                toast.error(response.data.message || "Unable to load dashboard data");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Unable to load dashboard data");
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadDashboardData(true);

        const interval = setInterval(() => {
            loadDashboardData(false);
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const getTimeText = (date) => {
        if (!date) {
            return "";
        }

        const now = new Date();
        const created = new Date(date);
        const diff = now - created;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) {
            return "Just now";
        }
        if (minutes < 60) {
            return `${minutes} min ago`;
        }
        if (hours < 24) {
            return `${hours} hours ago`;
        }
        return `${days} days ago`;
    };

    const sendMessage = async () => {
        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }
        try {
            setSending(true);

            const response = await axios.post(`${url}/api/message/send-all`, {
                message: message.trim()
            });

            if (response.data.success) {
                toast.success(response.data.message || "Message sent to all users successfully");
                setMessage("");
            } else {
                toast.error(response.data.message || "Unable to send message");
            }
        } catch (error) {
            console.log("SEND MESSAGE TO ALL ERROR:", error);
            toast.error(error.response?.data?.message || "Message sending failed");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[65vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#C8C1B2] border-t-[#2F6B4F] rounded-full animate-spin" />
            </div>
        );
    }

    const counts = dashboardData?.counts || {};
    const recentUsers = dashboardData?.recentUsers || [];
    const recentSongs = dashboardData?.recentSongs || [];
    const recentAlbums = dashboardData?.recentAlbums || [];
    const topArtists = dashboardData?.topArtists || [];

    return (
        <div className="w-full text-[#173F2B] text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                <div onClick={() => navigate("/list-song")} className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#DCECDD] flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faMusic} className="text-lg text-[#0B5A35]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#68766E]">
                                Total Songs
                            </p>
                            <p className="text-xl font-bold mt-0.5">
                                {counts.songs || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div onClick={() => navigate("/list-album")} className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#DCECDD] flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faCompactDisc} className="text-lg text-[#0B5A35]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#68766E]">
                                Total Albums
                            </p>
                            <p className="text-xl font-bold mt-0.5">
                                {counts.albums || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div onClick={() => navigate("/list-artist")} className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#DCECDD] flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faMicrophone} className="text-lg text-[#0B5A35]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#68766E]">
                                Total Artists
                            </p>
                            <p className="text-xl font-bold mt-0.5">
                                {counts.artists || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div onClick={() => navigate("/list-user")} className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#DCECDD] flex items-center justify-center shrink-0">
                            <FontAwesomeIcon icon={faUsers} className="text-lg text-[#0B5A35]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#68766E]">
                                Total Users
                            </p>
                            <p className="text-xl font-bold mt-0.5">
                                {counts.users || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
                <div className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-base">
                            Recent Songs
                        </h2>
                        <button onClick={() => { window.scrollTo(0, 0); navigate("/list-song"); }} className="text-[11px] border border-[#CCD4CC] px-2.5 py-1 rounded-md hover:bg-[#F1F5EF]">
                            View All
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        {recentSongs.slice(0, 3).map((song) => (
                            <div key={song._id} className="flex items-center gap-2.5 py-1.5 border-b border-[#E5E8E3] last:border-0">
                                <img src={song.image} alt={song.name} className="w-9 h-9 rounded-md object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs truncate">
                                        {song.name}
                                    </p>
                                    <p className="text-[11px] text-[#68766E] truncate">
                                        {song.artist?.name || song.album || "Unknown"}
                                    </p>
                                </div>
                                <span className="text-[10px] text-[#68766E] whitespace-nowrap">
                                    {getTimeText(song.createdAt)}
                                </span>
                            </div>
                        ))}
                        {recentSongs.length === 0 && (
                            <p className="text-xs text-[#68766E]">
                                No songs found.
                            </p>
                        )}
                    </div>
                </div>
                <div className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-base">
                            Recent Albums
                        </h2>
                        <button onClick={() => { window.scrollTo(0, 0); navigate("/list-album"); }} className="text-[11px] border border-[#CCD4CC] px-2.5 py-1 rounded-md hover:bg-[#F1F5EF]">
                            View All
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        {recentAlbums.slice(0, 3).map((album) => (
                            <div key={album._id} className="flex items-center gap-2.5 py-1.5 border-b border-[#E5E8E3] last:border-0">
                                <img src={album.image} alt={album.name} className="w-9 h-9 rounded-md object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs truncate">
                                        {album.name}
                                    </p>
                                    <p className="text-[11px] text-[#68766E] truncate">
                                        {album.desc}
                                    </p>
                                </div>
                                <span className="text-[10px] text-[#68766E] whitespace-nowrap">
                                    {getTimeText(album.createdAt)}
                                </span>
                            </div>
                        ))}
                        {recentAlbums.length === 0 && (
                            <p className="text-xs text-[#68766E]">
                                No albums found.
                            </p>
                        )}
                    </div>
                </div>
                <div className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg shadow-sm p-4 self-start">
                    <h2 className="font-bold text-base mb-3">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-2.5">
                        <button onClick={() => { window.scrollTo(0, 0); navigate("/add-song"); }} className="h-20 bg-[#F1EDE5] border border-[#E1DDD4] rounded-lg flex flex-col items-center justify-center gap-1.5 hover:bg-[#E9E4DA] transition">
                            <FontAwesomeIcon icon={faMusic} className="text-lg text-[#0B5A35]" />
                            <span className="text-xs font-medium">
                                Add Song
                            </span>
                        </button>
                        <button onClick={() => { window.scrollTo(0, 0); navigate("/add-album"); }} className="h-20 bg-[#F1EDE5] border border-[#E1DDD4] rounded-lg flex flex-col items-center justify-center gap-1.5 hover:bg-[#E9E4DA] transition">
                            <FontAwesomeIcon icon={faCompactDisc} className="text-lg text-[#0B5A35]" />
                            <span className="text-xs font-medium">
                                Add Album
                            </span>
                        </button>
                        <button onClick={() => { window.scrollTo(0, 0); navigate("/add-artist"); }} className="h-20 bg-[#F1EDE5] border border-[#E1DDD4] rounded-lg flex flex-col items-center justify-center gap-1.5 hover:bg-[#E9E4DA] transition">
                            <FontAwesomeIcon icon={faMicrophone} className="text-lg text-[#0B5A35]" />
                            <span className="text-xs font-medium">
                                Add Artist
                            </span>
                        </button>
                        <button onClick={() => { window.scrollTo(0, 0); navigate("/list-user"); }} className="h-20 bg-[#F1EDE5] border border-[#E1DDD4] rounded-lg flex flex-col items-center justify-center gap-1.5 hover:bg-[#E9E4DA] transition">
                            <FontAwesomeIcon icon={faUsers} className="text-lg text-[#0B5A35]" />
                            <span className="text-xs font-medium text-center">
                                Edit User's
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-base">
                            Recent Artists
                        </h2>
                        <button onClick={() => { window.scrollTo(0, 0); navigate("/list-artist"); }} className="text-[11px] border border-[#CCD4CC] px-2.5 py-1 rounded-md hover:bg-[#F1F5EF]">
                            View All
                        </button>
                    </div>
                    <div className="space-y-1">
                        {topArtists.slice(0, 3).map((artist) => (
                            <div key={artist._id} className="flex items-center gap-2.5 py-1.5 border-b border-[#E5E8E3] last:border-0">
                                {artist.image ? (
                                    <img src={artist.image} alt={artist.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-[#DCECDD] flex items-center justify-center shrink-0">
                                        <FontAwesomeIcon icon={faMicrophone} className="text-sm text-[#0B5A35]" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs truncate">
                                        {artist.name}
                                    </p>
                                    <p className="text-[11px] text-[#68766E]">
                                        Artist
                                    </p>
                                </div>
                                <span className="text-xs font-medium whitespace-nowrap">
                                    {artist.songCount} Songs
                                </span>
                            </div>
                        ))}
                        {topArtists.length === 0 && (
                            <p className="text-xs text-[#68766E]">
                                No artists found.
                            </p>
                        )}
                    </div>
                </div>
                <div className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-base">
                            Recent Users
                        </h2>
                        <button onClick={() => { window.scrollTo(0, 0); navigate("/list-user"); }} className="text-[11px] border border-[#CCD4CC] px-2.5 py-1 rounded-md hover:bg-[#F1F5EF]">
                            View All
                        </button>
                    </div>
                    <div className="space-y-1">
                        {recentUsers.slice(0, 3).map((user) => (
                            <div key={user._id} className="flex items-center gap-2.5 py-1.5 border-b border-[#E5E8E3] last:border-0">
                                <div className="w-9 h-9 rounded-full bg-[#DCECDD] flex items-center justify-center shrink-0">
                                    <FontAwesomeIcon icon={faUser} className="text-sm text-[#0B5A35]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-xs truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-[11px] text-[#68766E] truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentUsers.length === 0 && (
                            <p className="text-xs text-[#68766E]">
                                No users found.
                            </p>
                        )}
                    </div>
                </div>
                <div className="bg-[#FFFDF7] border border-[#D9DED6] rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faPaperPlane} className="text-[#0B5A35] text-sm" />
                        <h2 className="font-bold text-base">
                            Send Message to All Users
                        </h2>
                    </div>
                    <label className="text-xs font-semibold block mb-1.5">
                        Message
                    </label>
                    <textarea value={message} onChange={(e) => { if (e.target.value.length <= 500) { setMessage(e.target.value); } }} rows="5" placeholder="Type your message here..." disabled={sending} className="w-full border border-[#D9DED6] rounded-lg p-2.5 text-xs outline-none resize-none focus:border-[#2F6B4F] disabled:opacity-60" />
                    <div className="text-right text-[10px] text-[#68766E] mt-1">
                        {message.length}/500
                    </div>
                    <button onClick={sendMessage} disabled={sending || !message.trim()} className="w-full mt-2 bg-[#075B36] hover:bg-[#064B2D] disabled:opacity-60 text-white rounded-lg py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition">
                        <FontAwesomeIcon icon={faPaperPlane} />
                        {sending ? "Sending..." : "Send Message to All Users"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;