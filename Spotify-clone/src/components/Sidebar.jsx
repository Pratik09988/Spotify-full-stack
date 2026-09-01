import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMagnifyingGlass, faPlus, faHeart, faXmark, faMusic, faRightFromBracket, faBars } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { songsData } = useContext(PlayerContext);
    const [playlists, setPlaylists] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [creating, setCreating] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const loadPlaylists = () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            setPlaylists(user?.library || []);
        } catch (error) {
            console.log("Load playlists error:", error);
            setPlaylists([]);
        }
    };

    useEffect(() => {
        loadPlaylists();
        window.addEventListener("playlistUpdated", loadPlaylists);
        window.addEventListener("storage", loadPlaylists);
        return () => {
            window.removeEventListener("playlistUpdated", loadPlaylists);
            window.removeEventListener("storage", loadPlaylists);
        };
    }, []);

    const getPlaylistSongs = (playlist) => {
        if (!playlist || !Array.isArray(playlist.songs)) {
            return [];
        }

        const validSongs = playlist.songs.map((playlistSong) => {
            if (playlistSong && typeof playlistSong === "object" && playlistSong._id) {
                const foundSong = songsData?.find((song) => song?._id?.toString() === playlistSong._id?.toString());
                return foundSong || playlistSong;
            }

            const songId = playlistSong?.toString();

            if (!songId) {
                return null;
            }

            return songsData?.find((song) => song?._id?.toString() === songId);
        }).filter((song) => song && song._id);

        return validSongs;
    };

    const getPlaylistImage = (playlist) => {
        const playlistSongs = getPlaylistSongs(playlist);

        if (playlistSongs.length === 0) {
            return null;
        }

        return playlistSongs[0]?.image || null;
    };

    useEffect(() => {
        setPlaylists((currentPlaylists) => [...currentPlaylists]);
    }, [songsData]);

    const handleNavigate = (path) => {
        setMobileMenuOpen(false);

        if (location.pathname === path) {
            window.location.reload();
        } else {
            navigate(path);
        }
    };

    const handlePlaylistNavigate = (playlistId) => {
        setMobileMenuOpen(false);
        navigate(`/playlist/${playlistId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("playlistUpdated"));
        setMobileMenuOpen(false);
        navigate("/login");
    };

    const createPlaylist = () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            alert("Please login first");
            return;
        }

        setPlaylistName("");
        setShowCreate(true);
    };

    const handleCreatePlaylist = async () => {
        if (!playlistName.trim()) {
            alert("Please enter playlist name");
            return;
        }

        try {
            setCreating(true);
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user) {
                alert("Please login first");
                setCreating(false);
                return;
            }

            const userId = user.id || user._id;

            const response = await axios.post("http://localhost:4000/api/user/playlist/create", {
                userId,
                name: playlistName.trim(),
            });

            if (response.data.success) {
                const updatedUser = { ...user, library: response.data.library || [] };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setPlaylists(response.data.library || []);
                window.dispatchEvent(new CustomEvent("playlistUpdated"));
                setPlaylistName("");
                setShowCreate(false);
            } else {
                alert(response.data.message || "Unable to create playlist");
            }
        } catch (error) {
            console.log("Create playlist error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setCreating(false);
        }
    };

    const closeCreateModal = () => {
        if (creating) {
            return;
        }

        setShowCreate(false);
        setPlaylistName("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleCreatePlaylist();
        }
    };

    const SidebarContent = () => (
        <>
            <div className="bg-[#121212] h-[20%] rounded flex flex-col justify-around">
                <div onClick={() => handleNavigate("/")} className={`flex items-center gap-3 pl-8 cursor-pointer ${location.pathname === "/" ? "text-green-500" : "text-white"}`}>
                    <FontAwesomeIcon icon={faHouse} className="w-6" />
                    <p className="font-bold">Home</p>
                </div>
                <div onClick={() => handleNavigate("/search")} className={`flex items-center gap-3 pl-8 cursor-pointer ${location.pathname === "/search" ? "text-green-500" : "text-white"}`}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="w-6" />
                    <p className="font-bold">Search</p>
                </div>
                <div onClick={() => handleNavigate("/favorites")} className={`flex items-center gap-3 pl-8 cursor-pointer ${location.pathname === "/favorites" ? "text-green-500" : "text-white"}`}>
                    <FontAwesomeIcon icon={faHeart} className="w-6" />
                    <p className="font-bold">My Favorites</p>
                </div>
            </div>
            <div className="bg-[#121212] flex-1 min-h-0 rounded overflow-y-auto">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img className="w-6" src={assets.stack_icon} alt="" />
                        <p className="font-semibold">Your Library</p>
                    </div>
                    <button title="Add to Library" onClick={createPlaylist} className="text-[#a7a7a7] hover:text-green-600 hover:scale-150 transition-transform duration-200 cursor-pointer">
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
                {playlists.length === 0 ? (
                    <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-center">
                        <h1>Create Your First Playlist</h1>
                        <p className="font-light">it's easy we will help you</p>
                        <button onClick={createPlaylist} className="px-4 py-1.5 bg-white text-[13px] text-black rounded-full mt-4">Create Playlist</button>
                    </div>
                ) : (
                    <div className="px-2 pb-4">
                        {playlists.map((playlist) => {
                            const playlistSongs = getPlaylistSongs(playlist);
                            const songCount = playlistSongs.length;
                            const image = getPlaylistImage(playlist);
                            return (
                                <div key={playlist._id} onClick={() => handlePlaylistNavigate(playlist._id)} className={`p-3 rounded cursor-pointer hover:bg-[#242424] flex items-center gap-3 ${location.pathname === `/playlist/${playlist._id}` ? "bg-[#242424]" : ""}`}>
                                    <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-[#282828] flex items-center justify-center">
                                        {image ? (
                                            <img src={image} alt={playlist.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <FontAwesomeIcon icon={faMusic} className="text-gray-500 text-xl" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold truncate">{playlist.name}</p>
                                        <p className="text-sm text-gray-400">{songCount} {songCount === 1 ? "song" : "songs"}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <button onClick={handleLogout} title="Logout" className="w-full mt-2 px-4 py-3 rounded-lg bg-[#121212] text-red-500 hover:bg-[#2a1616] hover:text-red-400 transition-all duration-200 flex items-center gap-4 cursor-pointer flex-shrink-0 text-left">
                <FontAwesomeIcon icon={faRightFromBracket} className="text-lg" />
                <span className="font-semibold">Logout</span>
            </button>
        </>
    );

    return (
        <>
            <div className="w-[30%] h-full p-2 flex-col gap-2 text-white hidden lg:flex">
                <SidebarContent />
            </div>
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden fixed top-4 left-4 z-[80] w-11 h-11 rounded-full bg-[#121212] text-white flex items-center justify-center shadow-lg hover:bg-[#242424] transition">
                <FontAwesomeIcon icon={faBars} />
            </button>

            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[90]">
                    <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/70" />
                    <div className="relative w-[85%] max-w-[340px] h-full bg-black p-2 flex flex-col gap-2 text-white animate-[slideIn_0.25s_ease-out]">
                        <div className="bg-[#121212] rounded flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3">
                                <img className="w-7" src={assets.stack_icon} alt="" />
                                <p className="font-bold">Music Library</p>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-xl">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <div className="flex-1 min-h-0 flex flex-col gap-2">
                            <SidebarContent />
                        </div>
                    </div>
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] px-4" onClick={closeCreateModal}>
                    <div className="bg-[#242424] w-full max-w-[350px] rounded-xl p-6 text-white" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold">Create Playlist</h2>
                            <button onClick={closeCreateModal} className="text-gray-400 hover:text-white text-lg">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <input type="text" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} onKeyDown={handleKeyDown} placeholder="Playlist name" autoFocus className="w-full bg-[#121212] text-white rounded-lg px-4 py-3 outline-none focus:ring-1 focus:ring-white" />
                        <div className="flex justify-end gap-3 mt-5">
                            <button onClick={closeCreateModal} disabled={creating} className="px-4 py-2 rounded-full text-sm hover:bg-[#3a3a3a]">Cancel</button>
                            <button onClick={handleCreatePlaylist} disabled={creating} className="px-5 py-2 bg-white text-black rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                                {creating ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;