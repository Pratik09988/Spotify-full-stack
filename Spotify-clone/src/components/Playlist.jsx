import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faShuffle, faShareNodes, faTrash, faDownload, faHeart } from "@fortawesome/free-solid-svg-icons";

const Playlist = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { songsData, playWithId, playStatus, pause } = useContext(PlayerContext);

    const [playlist, setPlaylist] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [deletingPlaylist, setDeletingPlaylist] = useState(false);
    const [isShuffleOn, setIsShuffleOn] = useState(false);

    useEffect(() => {
        const loadPlaylist = () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));

                if (!user) {
                    setPlaylist(null);
                    setFavorites([]);
                    return;
                }

                const foundPlaylist = user?.library?.find((item) => item?._id?.toString() === id?.toString());

                setPlaylist(foundPlaylist || null);
                setFavorites(user?.favorites || []);
            } catch (error) {
                console.log("Playlist loading error:", error);
                setPlaylist(null);
                setFavorites([]);
            }
        };

        loadPlaylist();

        window.addEventListener("playlistUpdated", loadPlaylist);
        window.addEventListener("storage", loadPlaylist);

        return () => {
            window.removeEventListener("playlistUpdated", loadPlaylist);
            window.removeEventListener("storage", loadPlaylist);
        };
    }, [id]);

    const playlistSongs = useMemo(() => {
        if (!playlist?.songs || !Array.isArray(playlist.songs)) {
            return [];
        }

        return playlist.songs.map((songId) => {
            return songsData.find((song) => song?._id?.toString() === songId?.toString());
        }).filter(Boolean);
    }, [playlist, songsData]);

    const playlistImage = useMemo(() => {
        if (!playlist?.songs?.length) {
            return null;
        }

        const firstSongId = playlist.songs[0]?.toString();

        if (!firstSongId) {
            return null;
        }

        const firstSong = songsData.find((song) => song?._id?.toString() === firstSongId);

        return firstSong?.image || null;
    }, [playlist, songsData]);

    const totalDuration = useMemo(() => {
        let totalSeconds = 0;

        playlistSongs.forEach((song) => {
            const duration = song?.duration || "0:00";
            const parts = duration.split(":").map(Number);

            if (parts.length === 2) {
                totalSeconds += parts[0] * 60 + parts[1];
            }
        });

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        }

        return `${minutes} min`;
    }, [playlistSongs]);

    const isFavorite = (songId) => {
        return favorites.some((favoriteId) => favoriteId?.toString() === songId?.toString());
    };

    const getArtistName = (song) => {
        return song?.artist || song?.artistName || song?.singer || song?.desc || "";
    };

    const handlePlay = () => {
        if (!playlistSongs.length) return;

        playWithId(playlistSongs[0]._id, playlistSongs);
    };

    const handleShuffle = () => {
        if (!playlistSongs.length) return;

        if (isShuffleOn) {
            setIsShuffleOn(false);
            return;
        }

        const shuffled = [...playlistSongs];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setIsShuffleOn(true);

        playWithId(shuffled[0]._id, shuffled);
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: playlist?.name || "Playlist",
                    text: `Check out my playlist "${playlist?.name}"`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Playlist link copied!");
            }
        } catch (error) {
            console.log("Share cancelled");
        }
    };

    const deletePlaylist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (deletingPlaylist) return;

        const confirmDelete = window.confirm(`Are you sure you want to delete "${playlist?.name}" playlist?`);

        if (!confirmDelete) return;

        try {
            setDeletingPlaylist(true);

            const user = JSON.parse(localStorage.getItem("user"));

            if (!user) {
                alert("Please login first");
                return;
            }

            const userId = user.id || user._id;

            const response = await axios.post("http://localhost:4000/api/user/playlist/delete", {
                userId,
                playlistId: id,
            });

            if (!response.data.success) {
                alert(response.data.message || "Unable to delete playlist");
                return;
            }

            const updatedUser = {
                ...user,
                library: response.data.library || [],
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));

            window.dispatchEvent(new CustomEvent("playlistUpdated"));

            navigate(-1);
        } catch (error) {
            console.log("Delete playlist error:", error.response?.data || error.message);

            alert(error.response?.data?.message || "Unable to delete playlist");
        } finally {
            setDeletingPlaylist(false);
        }
    };

    const downloadSong = async (e, song) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const songUrl = song?.file || song?.audio || song?.url;

            if (!songUrl) {
                alert("Download file is not available for this song.");
                return;
            }

            const response = await fetch(songUrl);

            if (!response.ok) {
                throw new Error("Download failed");
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = `${song?.name || "song"}.mp3`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.log("Download error:", error);
            alert("Song download failed.");
        }
    };

    const removeSong = async (e, songId) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user) {
                alert("Please login first");
                return;
            }

            const userId = user.id || user._id;

            const response = await axios.post("http://localhost:4000/api/user/playlist/remove", {
                userId,
                playlistId: id,
                songId,
            });

            if (response.data.success) {
                const updatedUser = {
                    ...user,
                    library: response.data.library || [],
                };

                localStorage.setItem("user", JSON.stringify(updatedUser));

                const updatedPlaylist = updatedUser.library.find((item) => item?._id?.toString() === id?.toString());

                setPlaylist(updatedPlaylist || null);

                window.dispatchEvent(new CustomEvent("playlistUpdated"));
            } else {
                alert(response.data.message || "Unable to remove song");
            }
        } catch (error) {
            console.log(error.response?.data || error.message);

            alert(error.response?.data?.message || "Unable to remove song from playlist");
        }
    };

    const handleFavorite = async (e, song) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user) {
                alert("Please login first");
                return;
            }

            const userId = user.id || user._id;
            const songId = song?._id?.toString();

            if (!songId) return;

            const alreadyFavorite = isFavorite(songId);

            const endpoint = alreadyFavorite
                ? "http://localhost:4000/api/user/favorite/remove"
                : "http://localhost:4000/api/user/favorite/add";

            const response = await axios.post(endpoint, {
                userId,
                songId,
            });

            if (response.data.success) {
                const updatedFavorites = response.data.favorites || [];

                const updatedUser = {
                    ...user,
                    favorites: updatedFavorites,
                };

                localStorage.setItem("user", JSON.stringify(updatedUser));

                setFavorites(updatedFavorites);

                window.dispatchEvent(new CustomEvent("favoritesUpdated"));
            }
        } catch (error) {
            console.log(error.response?.data || error.message);

            alert(error.response?.data?.message || "Unable to update favorite");
        }
    };

    const getCreatedText = () => {
        if (!playlist?.createdAt) {
            return "Created recently";
        }

        const date = new Date(playlist.createdAt);

        if (isNaN(date.getTime())) {
            return "Created recently";
        }

        return `Created on ${date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })}`;
    };

    if (!playlist) {
        return (
            <div className="h-full bg-[#121212] text-white flex items-center justify-center">
                <p>Playlist not found</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-[#121212] text-white overflow-y-auto">
            <div className="px-2 sm:px-4 py-2 sm:py-3 bg-[#121212]">
                <Navbar />
            </div>

            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800/60 to-[#121212]" />

                <div className="relative px-4 sm:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-7">
                        <div className="flex-shrink-0">
                            {playlistImage ? (
                                <img src={playlistImage} alt={playlist.name} className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-cover rounded-lg shadow-2xl" />
                            ) : (
                                <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-lg bg-[#282828]" />
                            )}
                        </div>

                        <div className="pb-1 min-w-0 w-full text-center sm:text-left">
                            <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-4">Playlist</p>

                            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight mb-3 sm:mb-5 break-words">
                                {playlist.name}
                            </h1>

                            <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">{getCreatedText()}</p>

                            <p className="text-gray-200 text-xs sm:text-sm">
                                <span className="font-bold">{playlistSongs.length}</span>{" "}
                                {playlistSongs.length === 1 ? "song" : "songs"} • {totalDuration}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-6 sm:mt-8 flex-wrap">
                        <button type="button" onClick={playStatus ? pause : handlePlay} disabled={!playlistSongs.length} title={playStatus ? "Pause" : "Play"} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center transition hover:scale-105 disabled:opacity-50">
                            <FontAwesomeIcon icon={playStatus ? faPause : faPlay} className="text-lg sm:text-xl" />
                        </button>

                        <button type="button" onClick={handleShuffle} disabled={!playlistSongs.length} title="Shuffle" className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-500 hover:border-white flex items-center justify-center transition disabled:opacity-50 ${isShuffleOn ? "text-green-500" : "text-white"}`}>
                            <FontAwesomeIcon icon={faShuffle} className="text-base sm:text-lg" />
                        </button>

                        <button type="button" onClick={handleShare} title="Share" className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-500 hover:border-white text-white flex items-center justify-center transition">
                            <FontAwesomeIcon icon={faShareNodes} className="text-base sm:text-lg hover:text-green-500" />
                        </button>

                        <button type="button" onMouseDown={(e) => e.stopPropagation()} onClick={deletePlaylist} disabled={deletingPlaylist} title="Delete Playlist" className="h-10 sm:h-11 px-3 sm:px-5 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50">
                            <FontAwesomeIcon icon={faTrash} />
                            <span className="hidden xs:inline sm:inline">{deletingPlaylist ? "Deleting..." : "Delete Playlist"}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-3 sm:px-5 md:px-8 pb-12">
                <div className="hidden sm:grid grid-cols-[42px_minmax(280px,1.8fr)_1fr_1fr_90px_130px] gap-4 px-3 py-3 text-gray-400 border-b border-[#333] text-sm">
                    <p>#</p>
                    <p>Title</p>
                    <p>Album</p>
                    <p>Date Added</p>
                    <p className="text-center">Time</p>
                    <p className="text-center">Actions</p>
                </div>

                <div className="grid sm:hidden grid-cols-[1fr_60px_80px] gap-2 px-2 py-3 text-gray-400 border-b border-[#333] text-xs">
                    <p>Title</p>
                    <p className="text-center">Time</p>
                    <p className="text-center">Actions</p>
                </div>

                {playlistSongs.length === 0 ? (
                    <div className="text-gray-400 text-center py-16">
                        No songs in this playlist
                    </div>
                ) : (
                    playlistSongs.map((song, index) => (
                        <div key={song._id} onClick={() => playWithId(song._id, playlistSongs)} className="group cursor-pointer hover:bg-[#ffffff14] rounded-md transition">
                            <div className="hidden sm:grid grid-cols-[42px_minmax(280px,1.8fr)_1fr_1fr_90px_130px] gap-4 px-3 py-3 items-center text-[#a7a7a7]">
                                <p className="group-hover:text-white">{index + 1}</p>
                                <div className="flex items-center gap-4 min-w-0">
                                    <img src={song.image} alt={song.name} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-white truncate">{song.name}</p>
                                        <p className="text-gray-400 text-sm truncate">{getArtistName(song)}</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm truncate">{song.album || playlist.name}</p>
                                <p className="text-gray-400 text-sm">Recently Added</p>
                                <p className="text-gray-400 text-sm text-center">{song.duration}</p>
                                <div className="flex items-center justify-center gap-5" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                    <button type="button" onClick={(e) => downloadSong(e, song)} title="Download" className="text-gray-400 hover:text-white transition">
                                        <FontAwesomeIcon icon={faDownload} />
                                    </button>
                                    <button type="button" onClick={(e) => removeSong(e, song._id)} title="Remove from playlist" className="text-gray-400 hover:text-red-500 transition">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <button type="button" onClick={(e) => handleFavorite(e, song)} title={isFavorite(song._id) ? "Remove from Favorites" : "Add to Favorites"} className="transition hover:scale-110">
                                        <FontAwesomeIcon icon={faHeart} className={isFavorite(song._id) ? "text-green-500" : "text-gray-400 hover:text-white"} />
                                    </button>
                                </div>
                            </div>
                            <div className="sm:hidden grid grid-cols-[1fr_60px_80px] gap-2 px-2 py-3 items-center">
                                <div className="flex items-center gap-2 min-w-0">
                                    <img src={song.image} alt={song.name} className="w-11 h-11 rounded object-cover flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-white text-sm truncate">{song.name}</p>
                                        <p className="text-gray-400 text-xs truncate">{getArtistName(song)}</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs text-center whitespace-nowrap">{song.duration}</p>
                                <div className="flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                    <button type="button" onClick={(e) => downloadSong(e, song)} title="Download" className="text-gray-400 hover:text-white transition">
                                        <FontAwesomeIcon icon={faDownload} className="text-xs" />
                                    </button>
                                    <button type="button" onClick={(e) => removeSong(e, song._id)} title="Remove" className="text-gray-400 hover:text-red-500 transition">
                                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                    </button>
                                    <button type="button" onClick={(e) => handleFavorite(e, song)} title={isFavorite(song._id) ? "Remove from Favorites" : "Add to Favorites"} className="transition hover:scale-110">
                                        <FontAwesomeIcon icon={faHeart} className={isFavorite(song._id) ? "text-green-500" : "text-gray-400"} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Playlist;