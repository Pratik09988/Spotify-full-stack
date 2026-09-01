import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import { PlayerContext } from "../context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const Favorite = () => {
    const { songsData, playWithId, albumsData } = useContext(PlayerContext);
    const navigate = useNavigate();
    const [favoriteSongs, setFavoriteSongs] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.favorites) {
            setFavoriteSongs([]);
            return;
        }

        const songs = songsData.filter((song) => user.favorites.some((favoriteId) => favoriteId.toString() === song._id.toString()));

        setFavoriteSongs(songs);
    }, [songsData]);

    const handleRemoveFavorite = async (e, song) => {
        e.stopPropagation();

        try {
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user) {
                alert("Please login first");
                return;
            }

            const userId = user.id || user._id;
            const songId = song._id.toString();

            const response = await axios.post("http://localhost:4000/api/user/favorite/remove", {
                userId,
                songId,
            });

            if (response.data.success) {
                const updatedFavorites = response.data.favorites || [];
                localStorage.setItem("user", JSON.stringify({ ...user, favorites: updatedFavorites }));
                setFavoriteSongs((prevSongs) => prevSongs.filter((item) => item._id.toString() !== songId));
            }
        } catch (error) {
            console.log(error.response?.data || error.message);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };

    const handlePlayFavorite = (song) => {
        playWithId(song._id, favoriteSongs);
        const album = albumsData?.find((item) => item.name === song.album);
        if (album?._id) {
            navigate(`/album/${album._id}`);
        }
    };

    return (
        <div className="min-h-full bg-[#121212] text-white">
            <div className="mt-3 sm:mt-5">
                <Navbar />
            </div>
            <div className="px-3 sm:px-6 pt-5 sm:pt-6 pb-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-600 rounded flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faHeart} className="text-2xl sm:text-3xl text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-400">Playlist</p>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold truncate">My Favorites</h1>
                        <p className="text-gray-400 mt-1 sm:mt-2 text-sm">{favoriteSongs.length} {favoriteSongs.length === 1 ? "song" : "songs"}</p>
                    </div>
                </div>
                {favoriteSongs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
                        <FontAwesomeIcon icon={faHeart} className="text-5xl sm:text-6xl text-gray-600 mb-5" />
                        <h2 className="text-xl sm:text-2xl font-bold">No favorite songs yet</h2>
                        <p className="text-gray-400 mt-2 text-sm sm:text-base">Songs you like will appear here.</p>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="grid grid-cols-[1fr_70px_45px] sm:grid-cols-5 gap-2 px-2 sm:px-3 py-3 text-gray-400 border-b border-[#333] text-xs sm:text-sm">
                            <p><b className="mr-2 sm:mr-4">#</b>Title</p>
                            <p className="hidden sm:block">Album</p>
                            <p className="hidden sm:block">Date Added</p>
                            <p className="text-center">Duration</p>
                            <p className="text-center">Favorite</p>
                        </div>
                        {favoriteSongs.map((song, index) => (
                            <div key={song._id} onClick={() => handlePlayFavorite(song)} className="grid grid-cols-[1fr_70px_45px] sm:grid-cols-5 gap-2 p-2 sm:p-3 items-center text-[#a7a7a7] cursor-pointer hover:bg-[#ffffff1a] rounded transition">
                                <div className="flex items-center min-w-0">
                                    <b className="mr-2 sm:mr-4 text-gray-400 text-sm sm:text-base w-4 sm:w-auto">{index + 1}</b>
                                    <img src={song.image} alt="" className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded mr-2 sm:mr-4 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-white truncate text-sm sm:text-base">{song.name}</p>
                                        <p className="text-xs sm:text-sm text-gray-400 truncate">{song.desc}</p>
                                    </div>
                                </div>
                                <p className="text-[15px] truncate hidden sm:block">{song.album}</p>
                                <p className="text-[15px] hidden sm:block">Recently Added</p>
                                <p className="text-xs sm:text-[15px] text-center whitespace-nowrap">{song.duration}</p>
                                <div className="text-center cursor-pointer" onClick={(e) => handleRemoveFavorite(e, song)} title="Remove from Favorite">
                                    <FontAwesomeIcon icon={faHeart} className="text-green-500 hover:scale-125 transition-transform text-sm sm:text-base" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorite;