import React, { useContext, useEffect, useState } from 'react'
import Navbar from './Navbar'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'
import { PlayerContext } from '../context/PlayerContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faPlus, faHeart, faXmark, faMusic, faPlay, faPause, faShuffle, faShareNodes } from '@fortawesome/free-solid-svg-icons'

const DisplayAlbum = ({ album }) => {
    const { id } = useParams()
    const [albumData, setAlbumData] = useState("")
    const [favoriteSongs, setFavoriteSongs] = useState([])
    const [playlistModal, setPlaylistModal] = useState(false)
    const [playlists, setPlaylists] = useState([])
    const [selectedSong, setSelectedSong] = useState(null)
    const [newPlaylistName, setNewPlaylistName] = useState("")
    const [isShuffleOn, setIsShuffleOn] = useState(false)
    const { playWithId, albumsData, songsData, playStatus, play, pause, track } = useContext(PlayerContext)

    useEffect(() => {
        albumsData.forEach((item) => {
            if (item._id === id) {
                setAlbumData(item)
            }
        })
    }, [albumsData, id])

    useEffect(() => {
        const loadFavorites = () => {
            const user = JSON.parse(localStorage.getItem("user"))
            if (user) {
                setFavoriteSongs(user.favorites || [])
            } else {
                setFavoriteSongs([])
            }
        }

        loadFavorites()
        window.addEventListener("favoritesUpdated", loadFavorites)

        return () => {
            window.removeEventListener("favoritesUpdated", loadFavorites)
        }
    }, [])

    const loadPlaylists = () => {
        const user = JSON.parse(localStorage.getItem("user"))
        setPlaylists(user?.library || [])
    }

    useEffect(() => {
        loadPlaylists()
        window.addEventListener("playlistUpdated", loadPlaylists)

        return () => {
            window.removeEventListener("playlistUpdated", loadPlaylists)
        }
    }, [])

    const getPlaylistImage = (playlist) => {
        if (!playlist?.songs || playlist.songs.length === 0) {
            return null
        }

        const firstSongId = playlist.songs[0]?.toString()

        if (!firstSongId) {
            return null
        }

        const song = songsData?.find((item) => item?._id?.toString() === firstSongId)
        return song?.image || null
    }

    const handleDownload = (e, song) => {
        e.stopPropagation()

        const fileUrl = song.file

        if (!fileUrl) {
            console.log("Song file not found")
            return
        }

        const downloadUrl = fileUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(song.name)}/`)
        const link = document.createElement('a')

        link.href = downloadUrl
        link.download = `${song.name}.mp3`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleAddToLibrary = (e, song) => {
        e.stopPropagation()

        const user = JSON.parse(localStorage.getItem("user"))

        if (!user) {
            alert("Please login first")
            return
        }

        setSelectedSong(song)
        loadPlaylists()
        setPlaylistModal(true)
    }

    const createNewPlaylist = async () => {
        if (!newPlaylistName.trim()) {
            return
        }

        try {
            const user = JSON.parse(localStorage.getItem("user"))

            if (!user) {
                alert("Please login first")
                return
            }

            const userId = user.id || user._id

            const response = await axios.post("http://localhost:4000/api/user/playlist/create", {
                userId,
                name: newPlaylistName
            })

            if (response.data.success) {
                const updatedUser = {
                    ...user,
                    library: response.data.library
                }

                localStorage.setItem("user", JSON.stringify(updatedUser))
                setPlaylists(response.data.library)

                window.dispatchEvent(new CustomEvent("playlistUpdated"))

                const newPlaylist = response.data.library[response.data.library.length - 1]

                if (selectedSong) {
                    const addResponse = await axios.post("http://localhost:4000/api/user/playlist/add", {
                        userId,
                        playlistId: newPlaylist._id,
                        songId: selectedSong._id
                    })

                    if (addResponse.data.success) {
                        const finalUser = {
                            ...updatedUser,
                            library: addResponse.data.library
                        }

                        localStorage.setItem("user", JSON.stringify(finalUser))
                        setPlaylists(addResponse.data.library)

                        window.dispatchEvent(new CustomEvent("playlistUpdated"))
                    }
                }

                setNewPlaylistName("")
                setSelectedSong(null)
                setPlaylistModal(false)
            }
        } catch (error) {
            console.log(error.response?.data || error.message)
        }
    }

    const addSongToPlaylist = async (playlistId) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"))

            if (!user) {
                alert("Please login first")
                return
            }

            if (!selectedSong) {
                return
            }

            const userId = user.id || user._id

            const response = await axios.post("http://localhost:4000/api/user/playlist/add", {
                userId,
                playlistId,
                songId: selectedSong._id
            })

            if (response.data.success) {
                const updatedUser = {
                    ...user,
                    library: response.data.library
                }

                localStorage.setItem("user", JSON.stringify(updatedUser))
                setPlaylists(response.data.library)

                window.dispatchEvent(new CustomEvent("playlistUpdated"))

                setPlaylistModal(false)
                setSelectedSong(null)
            }
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong")
        }
    }

    const handleFavorite = async (e, song) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            const user = JSON.parse(localStorage.getItem("user"))

            if (!user) {
                alert("Please login first")
                return
            }

            const userId = user.id || user._id
            const songId = song._id.toString()

            const isFavorite = favoriteSongs.some((favoriteId) => favoriteId?.toString() === songId)

            const endpoint = isFavorite
                ? "http://localhost:4000/api/user/favorite/remove"
                : "http://localhost:4000/api/user/favorite/add"

            const response = await axios.post(endpoint, {
                userId,
                songId
            })

            if (response.data.success) {
                let updatedFavorites

                if (Array.isArray(response.data.favorites)) {
                    updatedFavorites = response.data.favorites
                } else {
                    updatedFavorites = isFavorite
                        ? favoriteSongs.filter((favoriteId) => favoriteId?.toString() !== songId)
                        : [...favoriteSongs, songId]
                }

                setFavoriteSongs(updatedFavorites)

                localStorage.setItem("user", JSON.stringify({
                    ...user,
                    favorites: updatedFavorites
                }))

                window.dispatchEvent(new CustomEvent("favoritesUpdated"))
            }
        } catch (error) {
            console.log(error.response?.data || error.message)
            alert(error.response?.data?.message || "Something went wrong")
        }
    }

    const playlistSongs = songsData.filter((item) => item.album === albumData.name)

    const totalDuration = playlistSongs.reduce((total, song) => {
        const [minutes, seconds] = song.duration.split(":").map(Number)
        return total + (minutes * 60) + seconds
    }, 0)

    const totalMinutes = Math.floor(totalDuration / 60)
    const totalSeconds = totalDuration % 60
    const formattedTotalDuration = `${totalMinutes} min ${totalSeconds.toString().padStart(2, "0")} sec`

    const isAlbumPlaying = playStatus && track && playlistSongs.some((song) => song._id === track._id)

    const handlePlay = () => {
        if (!playlistSongs.length) return
        playWithId(playlistSongs[0]._id, playlistSongs)
    }

    const handleShuffle = () => {
        if (!playlistSongs.length) return

        if (isShuffleOn) {
            setIsShuffleOn(false)
            return
        }

        const shuffled = [...playlistSongs]

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        setIsShuffleOn(true)
        playWithId(shuffled[0]._id, shuffled)
    }

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: playlist?.name || "Playlist",
                    text: `Check out my playlist "${playlist?.name}"`,
                    url: window.location.href,
                })
            } else {
                await navigator.clipboard.writeText(window.location.href)
                alert("Playlist link copied!")
            }
        } catch (error) {
            console.log("Share cancelled")
        }
    }

    return albumData ? (
        <div className="min-h-full relative" style={{ background: `linear-gradient(to bottom, ${albumData.bgColour}, #121212)` }}>
            <Navbar />
            <div className="mt-10 ml-10 flex gap-8 flex-col md:flex-row md:items-start">
                <img className="w-48 h-48 rounded object-cover" src={albumData.image} alt="" />
                <div className="flex flex-col h-48 justify-between flex-1">
                    <div>
                        <h3 className="text-4xl font-bold mb-2 md:text-6xl">{albumData.name}</h3>
                        <h4 className="m-2">{albumData.desc}</h4>
                        <p className="mt-1">
                            <img className="inline-block w-5" src={assets.spotify_logo} alt="" />
                            <b> Spotify</b>
                            <b> • {playlistSongs.length} Songs</b> • {formattedTotalDuration}
                        </p>
                    </div>
                    <div className="flex items-center mt-5 gap-4">
                        <button type="button" onClick={isAlbumPlaying ? pause : handlePlay} disabled={!playlistSongs.length} title={isAlbumPlaying ? "Pause" : "Play"} className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center transition hover:scale-105 disabled:opacity-50">{isAlbumPlaying ? <FontAwesomeIcon icon={faPause} className="text-xl" /> : <FontAwesomeIcon icon={faPlay} className="text-xl ml-1" />}</button>
                        <button type="button" onClick={handleShuffle} disabled={!playlistSongs.length} title="Shuffle" className={`w-10 h-10 rounded-full border border-gray-500 hover:border-white flex items-center justify-center transition disabled:opacity-50 ${isShuffleOn ? "text-green-500" : "text-white"}`}>
                            <FontAwesomeIcon icon={faShuffle} className="text-lg" />
                        </button>
                        <button type="button" onClick={handleShare} title="Share" className="w-10 h-10 rounded-full border border-gray-500 hover:border-white text-white flex items-center justify-center transition">
                            <FontAwesomeIcon icon={faShareNodes} className="text-lg hover:text-green-500" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 mt-10 mb-4 pl-2 text-[#a7a7a7]">
                <p><b className="mr-4">#</b>Title</p>
                <p>Album</p>
                <p className="hidden sm:block">Date Added</p>
                <img className="m-auto w-4" src={assets.clock_icon} alt="" />
                <p className="text-center">Actions</p>
            </div>
            <hr />
            {songsData.filter((item) => item.album === albumData.name).map((item, index) => (
                <div key={item._id} onClick={() => playWithId(item._id, songsData.filter((song) => song.album === albumData.name))} className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-2 items-center text-[#a7a7a7] cursor-pointer hover:bg-[#ffffff2b]">
                    <p className="text-white flex items-center min-w-0">
                        <b className="mr-4 text-[#c5c1c1]">{index + 1}</b>
                        <img className="inline w-10 h-10 mr-5 object-cover" src={item.image} alt="" />
                        <span className="truncate">{item.name}</span>
                    </p>
                    <p className="text-[15px] truncate">{albumData.name}</p>
                    <p className="text-[15px] hidden sm:block">5 Days Ago</p>
                    <p className="text-[15px] text-center">{item.duration}</p>
                    <div className="flex justify-center items-center gap-4" onClick={(e) => e.stopPropagation()}>
                        <button title="Download" onClick={(e) => handleDownload(e, item)} className="text-[#a7a7a7] hover:text-green-600 hover:scale-150 transition-transform duration-200 cursor-pointer">
                            <FontAwesomeIcon icon={faDownload} />
                        </button>
                        <button title="Add to Library" onClick={(e) => handleAddToLibrary(e, item)} className="text-[#a7a7a7] hover:text-green-600 hover:scale-150 transition-transform duration-200 cursor-pointer">
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                        <button type="button" title={favoriteSongs.some((favoriteId) => favoriteId?.toString() === item._id.toString()) ? "Remove from Favorite" : "Add to Favorite"} onClick={(e) => handleFavorite(e, item)} className="text-[#a7a7a7] hover:text-green-600 hover:scale-150 transition-transform duration-200 cursor-pointer">
                            <FontAwesomeIcon icon={faHeart} className={favoriteSongs.some((favoriteId) => favoriteId?.toString() === item._id.toString()) ? "text-green-500" : ""} />
                        </button>
                    </div>
                </div>
            ))}
            {playlistModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#242424] w-[350px] rounded-xl p-5 text-white">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold">Add to Playlist</h2>
                            <button onClick={() => { setPlaylistModal(false); setSelectedSong(null); setNewPlaylistName("") }} className="text-gray-400 hover:text-white">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        {playlists.length > 0 && (
                            <div className="max-h-52 overflow-y-auto pr-1">
                                {playlists.map((playlist) => {
                                    const playlistImage = getPlaylistImage(playlist)
                                    return (
                                        <button key={playlist._id} onClick={() => addSongToPlaylist(playlist._id)} className="w-full text-left p-3 rounded-lg hover:bg-[#3a3a3a] flex items-center gap-3 transition">
                                            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-[#333] flex items-center justify-center">
                                                {playlistImage ? (
                                                    <img src={playlistImage} alt={playlist.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faMusic} className="text-gray-500 text-lg" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold truncate">{playlist.name}</p>
                                                <p className="text-sm text-gray-400">{playlist.songs?.length || 0} {playlist.songs?.length === 1 ? "song" : "songs"}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                        <div className="border-t border-gray-600 mt-4 pt-4">
                            <p className="font-semibold mb-2">Create New Playlist</p>
                            <div className="flex gap-2">
                                <input value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Playlist name" className="flex-1 bg-[#121212] rounded px-3 py-2 outline-none" />
                                <button onClick={createNewPlaylist} className="bg-white text-black px-4 rounded-full font-medium hover:scale-105 transition">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : null
}

export default DisplayAlbum