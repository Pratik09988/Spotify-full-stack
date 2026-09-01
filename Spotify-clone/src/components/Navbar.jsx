import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faXmark, faEnvelope, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ activeFilter, setActiveFilter }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";
    const [messages, setMessages] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const fetchMessages = async () => {
        if (!user?._id && !user?.id) {
            return [];
        }
        try {
            setLoadingMessages(true);
            const userId = user._id || user.id;
            const response = await axios.get(`${url}/api/message/user/${userId}`);
            if (response.data.success) {
                const fetchedMessages = response.data.messages || [];
                setMessages(fetchedMessages);
                return fetchedMessages;
            }
            return [];
        } catch (error) {
            console.log("FETCH MESSAGES ERROR:", error);
            return [];
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const unreadCount = messages.filter((item) => item.isRead === false).length;

    const markMessagesAsRead = async (latestMessages) => {
        if (!latestMessages || latestMessages.length === 0) {
            return;
        }
        const unreadMessages = latestMessages.filter((item) => item.isRead === false);
        if (unreadMessages.length === 0) {
            return;
        }
        try {
            await Promise.all(
                unreadMessages.map(async (item) => {
                    try {
                        await axios.put(`${url}/api/message/${item._id}/read`);
                    } catch (error) {
                        console.log("MARK READ ERROR:", error);
                    }
                })
            );
            setMessages((currentMessages) => currentMessages.map((item) => ({ ...item, isRead: true })));
        } catch (error) {
            console.log("MARK MESSAGES READ ERROR:", error);
        }
    };

    const handleNotificationClick = async () => {
        try {
            const latestMessages = await fetchMessages();
            setShowNotifications(true);
            await markMessagesAsRead(latestMessages);
        } catch (error) {
            console.log("NOTIFICATION CLICK ERROR:", error);
            setShowNotifications(true);
        }
    };

    const closeNotifications = async () => {
        try {
            const userId = user?._id || user?.id;
            setShowNotifications(false);
            if (userId) {
                await axios.delete(`${url}/api/message/user/notifications`, { data: { userId } });
            }
            setMessages([]);
            console.log("NOTIFICATIONS DELETED AFTER POPUP CLOSE");
        } catch (error) {
            console.log("DELETE NOTIFICATIONS ERROR:", error);
        }
    };

    const formatMessageTime = (createdAt) => {
        if (!createdAt) {
            return "";
        }
        const date = new Date(createdAt);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
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
            return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        }
        if (days < 7) {
            return `${days} day${days !== 1 ? "s" : ""} ago`;
        }
        return date.toLocaleDateString();
    };

    return (
        <>
            <div className="w-full flex items-center justify-between font-semibold mt-4 px-1 gap-2">
                <div className="flex items-center gap-2 ml-12 sm:ml-14 lg:ml-0 flex-shrink-0">
                    <img onClick={() => navigate(-1)} className="w-8 h-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-[#242424] transition" src={assets.arrow_left} alt="Back" />
                    <img onClick={() => navigate(+1)} className="w-8 h-8 bg-black p-2 rounded-2xl cursor-pointer hover:bg-[#242424] transition" src={assets.arrow_right} alt="Forward" />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
                    <p className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer whitespace-nowrap">
                        Explore Premium
                    </p>
                    <p className="hidden sm:block bg-white text-black py-1 px-3 rounded-2xl text-[15px] cursor-pointer whitespace-nowrap">
                        Install App
                    </p>
                    <div className="relative">
                        <button type="button" onClick={handleNotificationClick} className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-[#252525] transition">
                            <FontAwesomeIcon icon={faBell} className="text-white text-lg sm:text-xl" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#121212]">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 top-12 z-50 w-[370px] max-w-[calc(100vw-20px)] sm:max-w-[370px] bg-[#151515] border border-[#303030] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden">
                                <div className="px-4 sm:px-5 py-4 border-b border-[#2c2c2c] bg-[#191919]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0">
                                                <FontAwesomeIcon icon={faBell} className="text-white text-sm" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-white text-sm sm:text-[15px] font-bold">Notifications</h3>
                                                <p className="text-gray-500 text-[10px] sm:text-[11px] mt-0.5">Messages from admin</p>
                                            </div>
                                        </div>

                                        <button type="button" onClick={closeNotifications} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#292929] transition flex-shrink-0">
                                            <FontAwesomeIcon icon={faXmark} className="text-gray-400" />
                                        </button>
                                    </div>
                                    {unreadCount > 0 ? (
                                        <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                            <span className="text-red-400 text-[10px] sm:text-[11px] font-semibold">
                                                You have {unreadCount} new message{unreadCount !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                                            <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-xs" />
                                            <span className="text-green-400 text-[10px] sm:text-[11px] font-semibold">Message seen</span>
                                        </div>
                                    )}
                                </div>
                                <div className="max-h-[430px] overflow-y-auto p-2 sm:p-3">
                                    {loadingMessages && (
                                        <div className="py-12 text-center">
                                            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-3" />
                                            <p className="text-gray-500 text-xs">Loading notifications...</p>
                                        </div>
                                    )}
                                    {!loadingMessages && messages.length === 0 && (
                                        <div className="py-12 text-center">
                                            <div className="w-14 h-14 rounded-full bg-[#222] flex items-center justify-center mx-auto mb-4">
                                                <FontAwesomeIcon icon={faCircleCheck} className="text-gray-500 text-xl" />
                                            </div>
                                            <p className="text-white text-sm font-semibold">You're all caught up</p>
                                            <p className="text-gray-500 text-xs mt-1">No messages available</p>
                                        </div>
                                    )}
                                    {!loadingMessages && messages.length > 0 && messages.map((item) => (
                                        <div key={item._id} className="relative mb-2 p-3 sm:p-4 rounded-xl border bg-[#1d1d1d] border-[#2c2c2c]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#292929] flex items-center justify-center shrink-0">
                                                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 text-xs sm:text-sm" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white text-xs font-semibold">Message from Admin</p>
                                                    <p className="text-gray-500 text-[10px] mt-0.5">{formatMessageTime(item.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 pl-11 sm:pl-12">
                                                <p className="text-gray-300 text-xs sm:text-sm leading-5 break-words">{item.message}</p>
                                            </div>
                                            <div className="mt-3 ml-11 sm:ml-12 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-[9px]" />
                                                <span className="text-[9px] text-green-400 font-semibold">Seen</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {messages.length > 0 && (
                                    <div className="px-4 py-3 border-t border-[#2c2c2c] bg-[#191919]">
                                        <div className="flex items-center justify-center gap-2">
                                            <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-xs" />
                                            <p className="text-gray-500 text-[10px]">Close to remove this message</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <p onClick={() => navigate("/profile")} className="text-lg sm:text-xl bg-purple-500 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer font-bold transition flex-shrink-0">
                        {firstLetter}
                    </p>
                </div>
            </div>
        </>
    );
};

export default Navbar;