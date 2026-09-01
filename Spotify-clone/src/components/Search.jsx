import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { url } from "../App";
import { PlayerContext } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faPlus, faHeart, faXmark, faMusic, faUser } from "@fortawesome/free-solid-svg-icons";

const Search = () => {
    const [search, setSearch] = useState("");
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const [playlistModal, setPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const { playWithId, songsData } = useContext(PlayerContext);
    const navigate = useNavigate();
    
    useEffect(() => {
        const loadFavorites = () => {
            const user = JSON.parse(localStorage.getItem("user"));
            setFavoriteSongs(user ? user.favorites || [] : []);
        };
        loadFavorites();
        window.addEventListener("favoritesUpdated", loadFavorites);

        return () => {
            window.removeEventListener("favoritesUpdated", loadFavorites);
        };
    }, []);

    const loadPlaylists = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        setPlaylists(user?.library || []);
    };

    useEffect(() => {
        loadPlaylists();
        window.addEventListener("playlistUpdated", loadPlaylists);
        return () => {
            window.removeEventListener("playlistUpdated", loadPlaylists);
        };
    }, []);

    const getPlaylistImage = (playlist) => {
        if (!playlist?.songs || playlist.songs.length === 0) {
            return null;
        }
        const firstSongId = playlist.songs[0]?.toString();
        if (!firstSongId) {
            return null;
        }
        const song = songsData?.find((item) => item?._id?.toString() === firstSongId);
        return song?.image || null;
    };

    useEffect(() => {
        const searchData = async () => {
            if (!search.trim()) {
                setSongs([]);
                setAlbums([]);
                setArtists([]);
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get(`${url}/api/song/search?query=${encodeURIComponent(search)}`);
                console.log("Search response:", response.data);
                if (response.data.success) {
                    setSongs(response.data.songs || []);
                    setAlbums(response.data.albums || []);
                    setArtists(response.data.artists || []);
                } else {
                    setSongs([]);
                    setAlbums([]);
                    setArtists([]);
                }
            } catch (error) {
                console.log("Search error:", error);
                setSongs([]);
                setAlbums([]);
                setArtists([]);
            } finally {
                setLoading(false);
            }
        };
        const timer = setTimeout(() => {
            searchData();
        }, 400);
        return () => {
            clearTimeout(timer);
        };
    }, [search]);
    const isFavorite = (songId) => {
        return favoriteSongs.some((favoriteId) => favoriteId?.toString() === songId?.toString());
    };
    const handleDownload = (e, song) => {
        e.preventDefault();
        e.stopPropagation();
        const fileUrl = song?.file;
        if (!fileUrl) {
            alert("Song file not found");
            return;
        }
        const downloadUrl = fileUrl.replace("/upload/", `/upload/fl_attachment:${encodeURIComponent(song.name)}/`);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${song.name}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleAddToLibrary = (e, song) => {
        e.preventDefault();
        e.stopPropagation();
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("Please login first");
            return;
        }
        setSelectedSong(song);
        loadPlaylists();
        setPlaylistModal(true);
    };

    const createNewPlaylist = async () => {
        if (!newPlaylistName.trim()) {
            alert("Please enter playlist name");
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) {
                alert("Please login first");
                return;
            }
            const userId = user.id || user._id;
            const response = await axios.post(`${url}/api/user/playlist/create`, {
                userId,
                name: newPlaylistName.trim()
            });
            if (!response.data.success) {
                alert(response.data.message || "Unable to create playlist");
                return;
            }
            const updatedUser = {
                ...user,
                library: response.data.library || []
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setPlaylists(response.data.library || []);
            window.dispatchEvent(new CustomEvent("playlistUpdated"));

            const newPlaylist = response.data.library[response.data.library.length - 1];

            if (selectedSong && newPlaylist) {
                const addResponse = await axios.post(`${url}/api/user/playlist/add`, {
                    userId,
                    playlistId: newPlaylist._id,
                    songId: selectedSong._id
                });
                if (addResponse.data.success) {
                    const finalUser = {
                        ...updatedUser,
                        library: addResponse.data.library || []
                    };
                    localStorage.setItem("user", JSON.stringify(finalUser));
                    setPlaylists(addResponse.data.library || []);
                    window.dispatchEvent(new CustomEvent("playlistUpdated"));
                }
            }
            setNewPlaylistName("");
            setSelectedSong(null);
            setPlaylistModal(false);
        } catch (error) {
            console.log("Create playlist error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };
    const addSongToPlaylist = async (playlistId) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) {
                alert("Please login first");
                return;
            }
            if (!selectedSong) {
                return;
            }
            const userId = user.id || user._id;
            const response = await axios.post(`${url}/api/user/playlist/add`, {
                userId,
                playlistId,
                songId: selectedSong._id
            });
            if (response.data.success) {
                const updatedUser = {
                    ...user,
                    library: response.data.library || []
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setPlaylists(response.data.library || []);
                window.dispatchEvent(new CustomEvent("playlistUpdated"));
                setPlaylistModal(false);
                setSelectedSong(null);
            } else {
                alert(response.data.message || "Unable to add song");
            }
        } catch (error) {
            console.log("Add playlist error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Something went wrong");
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
            const songId = song._id.toString();
            const alreadyFavorite = favoriteSongs.some((favoriteId) => favoriteId?.toString() === songId);
            const endpoint = alreadyFavorite ? `${url}/api/user/favorite/remove` : `${url}/api/user/favorite/add`;
            const response = await axios.post(endpoint, {
                userId,
                songId
            });

            if (response.data.success) {
                let updatedFavorites;
                if (Array.isArray(response.data.favorites)) {
                    updatedFavorites = response.data.favorites;
                } else {
                    updatedFavorites = alreadyFavorite
                        ? favoriteSongs.filter((favoriteId) => favoriteId?.toString() !== songId)
                        : [...favoriteSongs, songId];
                }
                setFavoriteSongs(updatedFavorites);
                localStorage.setItem("user", JSON.stringify({
                    ...user,
                    favorites: updatedFavorites
                }));
                window.dispatchEvent(new CustomEvent("favoritesUpdated"));
            }
        } catch (error) {
            console.log("Favorite error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Something went wrong");
        }
    };
    const closePlaylistModal = () => {
        setPlaylistModal(false);
        setSelectedSong(null);
        setNewPlaylistName("");
    };

    return (
        <div className="p-5 w-full h-full overflow-y-auto text-white">
            <Navbar />
            <div className="flex items-center gap-3 bg-[#242424] rounded-full px-5 py-3 w-full mt-3 max-w-[600px]">
                <span className="text-xl">🔍</span>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="What do you want to play?" className="bg-transparent outline-none text-white w-full" autoFocus />
            </div>
            {loading && <p className="text-gray-400 mt-5">Searching...</p>}
            {!loading && search && songs.length === 0 && albums.length === 0 && artists.length === 0 && (
                <p className="text-gray-400 mt-8">No songs, albums or artists found</p>
            )}

            <div className="mt-8 flex flex-col gap-2 max-w-[1000px]">
                {songs.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold mt-2 mb-3">Songs</h2>
                        {songs.map((item) => (
                            <div key={item._id} onClick={() => playWithId(item._id)} className="flex items-center gap-4 p-3 rounded cursor-pointer hover:bg-[#ffffff1a] group">
                                <img src={item.image} alt="" className="w-14 h-14 object-cover rounded flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold truncate">{item.name}</p>
                                    <p className="text-gray-400 text-sm truncate">{item.album !== "none" ? item.album : "Single"}</p>
                                </div>
                                <div className="flex items-center justify-center gap-5 pr-3" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                                    <button type="button" title="Download" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => handleDownload(e, item)} className="text-[#a7a7a7] hover:text-green-600 hover:scale-150 transition-transform duration-200 cursor-pointer">
                                        <FontAwesomeIcon icon={faDownload} />
                                    </button>
                                    <button type="button" title="Add to Library" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => handleAddToLibrary(e, item)} className="text-[#a7a7a7] hover:text-green-600 hover:scale-150 transition-transform duration-200 cursor-pointer">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <button type="button" title={isFavorite(item._id) ? "Remove from Favorite" : "Add to Favorite"} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => handleFavorite(e, item)} className="text-[#a7a7a7] hover:text-green-600 hover:scale-150 transition-transform duration-200 cursor-pointer">
                                        <FontAwesomeIcon icon={faHeart} className={isFavorite(item._id) ? "text-green-500" : ""} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {albums.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold mt-8 mb-3">Albums</h2>
                        {albums.map((item) => (
                            <div key={item._id} onClick={() => navigate(`/album/${item._id}`)} className="flex items-center gap-4 p-3 rounded cursor-pointer hover:bg-[#ffffff1a]">
                                <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded" />
                                <div>
                                    <p className="text-white font-semibold">{item.name}</p>
                                    <p className="text-gray-400 text-sm">Album</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
                {artists.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold mt-8 mb-3">Artists</h2>
                        {artists.map((item) => (
                            <div key={item._id} onClick={() => navigate(`/artist/${item._id}`)} className="flex items-center gap-4 p-3 rounded cursor-pointer hover:bg-[#ffffff1a]">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#242424] flex items-center justify-center flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} className="text-gray-500 text-xl" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{item.name}</p>
                                    <p className="text-gray-400 text-sm">Artist</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
            {playlistModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={closePlaylistModal}>
                    <div className="bg-[#242424] w-[350px] max-w-[90%] rounded-xl p-5 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold">Add to Playlist</h2>
                            <button type="button" onClick={closePlaylistModal} className="text-gray-400 hover:text-white transition">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        {playlists.length > 0 ? (
                            <div className="max-h-48 overflow-y-auto">
                                {playlists.map((playlist) => {
                                    const playlistImage = getPlaylistImage(playlist);
                                    return (
                                        <button type="button" key={playlist._id} onClick={() => addSongToPlaylist(playlist._id)} className="w-full text-left p-3 rounded hover:bg-[#3a3a3a] transition flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-[#333] flex items-center justify-center">
                                                {playlistImage ? (
                                                    <img src={playlistImage} alt={playlist.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faMusic} className="text-gray-500 text-lg" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold truncate">{playlist.name}</p>
                                                <p className="text-sm text-gray-400">
                                                    {playlist.songs?.length || 0}{" "}
                                                    {playlist.songs?.length === 1 ? "song" : "songs"}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm py-3">No playlists yet.</p>
                        )}
                        <div className="border-t border-gray-600 mt-4 pt-4">
                            <p className="font-semibold mb-2">Create New Playlist</p>
                            <div className="flex gap-2">
                                <input value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Playlist name" className="flex-1 bg-[#121212] rounded px-3 py-2 outline-none" />
                                <button type="button" onClick={createNewPlaylist} className="bg-white text-black px-4 rounded-full font-medium hover:scale-105 transition">
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;