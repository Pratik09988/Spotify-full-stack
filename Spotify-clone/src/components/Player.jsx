import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShuffle, faBackwardStep, faPlay, faPause, faForwardStep, faRepeat, faPlayCircle, faList, faVolumeHigh, faVolumeLow, faVolumeXmark, faDisplay } from "@fortawesome/free-solid-svg-icons";

function Player() {
    const navigate = useNavigate();
    const { track, songsData, albumsData, seekBar, seekBg, seekSong, playStatus, play, pause, time, previous, next, toggleShuffle, toggleRepeat, shuffle, repeatMode, currentQueue, showNowPlaying, toggleNowPlaying, showQueue, toggleQueue, volume, isMuted, toggleMute, changeVolume, toggleFullscreen } = useContext(PlayerContext);

    if (!track) {
        return null;
    }

    const currentIndex = currentQueue.findIndex((song) => song._id === track._id);

    const previousTrack =
        currentIndex > 0
            ? currentQueue[currentIndex - 1]
            : null;

    const currentTrack =
        currentIndex !== -1
            ? currentQueue[currentIndex]
            : track;

    const nextTrack =
        currentIndex !== -1 &&
        currentIndex < currentQueue.length - 1
            ? currentQueue[currentIndex + 1]
            : null;

    const handleCurrentSongClick = () => {
        if (!track) {
            return;
        }

        const albumName = track.album;

        if (!albumName) {
            return;
        }

        const album = albumsData.find((item) => item?.name?.toLowerCase() === albumName?.toLowerCase());

        if (!album) {
            return;
        }

        navigate(`/album/${album._id}`);
    };

    const QueueSong = ({ song, label, isCurrent = false }) => {
        if (!song) {
            return null;
        }

        return (
            <div className={`flex items-center gap-3 p-2 rounded-lg transition ${isCurrent ? "bg-[#333]" : "hover:bg-[#2d2d2d]"}`}>
                <img src={song.image} alt="" className="w-11 h-11 rounded object-cover flex-shrink-0" />

                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrent ? "text-green-500" : "text-white"}`}>
                        {song.name}
                    </p>

                    <p className="text-xs text-gray-400 truncate">
                        {song.desc}
                    </p>
                </div>

                <span className={`text-[10px] flex-shrink-0 ${isCurrent ? "text-green-500" : "text-gray-500"}`}>
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div className="h-[10%] min-h-[70px] bg-black flex justify-between items-center text-white px-2 sm:px-4 relative">

            <div onClick={handleCurrentSongClick} className={`flex items-center gap-2 sm:gap-4 min-w-0 w-[35%] sm:w-[30%] lg:w-auto lg:min-w-[220px] ${track.album ? "cursor-pointer hover:bg-[#ffffff12] rounded-lg p-1 transition" : "cursor-default"}`}>

                <img className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded object-cover flex-shrink-0" src={track.image} alt="" />

                <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm md:text-base">
                        {track.name}
                    </p>

                    <p className="text-gray-400 truncate text-[10px] sm:text-xs md:text-sm">
                        {track.desc}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-1 w-[55%] sm:w-[50%] lg:w-auto">

                <div className="flex gap-3 sm:gap-4 items-center">
                    <FontAwesomeIcon onClick={toggleShuffle} icon={faShuffle} className={`w-3 sm:w-4 cursor-pointer ${shuffle ? "text-green-500 opacity-100" : "opacity-70"}`} />

                    <FontAwesomeIcon onClick={previous} icon={faBackwardStep} className="w-3 sm:w-4 cursor-pointer hover:text-green-500" />

                    {playStatus ? (
                        <FontAwesomeIcon onClick={pause} icon={faPause} className="w-3 sm:w-4 cursor-pointer hover:text-green-500" />
                    ) : (
                        <FontAwesomeIcon onClick={play} icon={faPlay} className="w-3 sm:w-4 cursor-pointer hover:text-green-500" />
                    )}

                    <FontAwesomeIcon onClick={next} icon={faForwardStep} className="w-3 sm:w-4 cursor-pointer hover:text-green-500" />

                    <FontAwesomeIcon onClick={toggleRepeat} icon={faRepeat} className={`w-3 sm:w-4 cursor-pointer ${repeatMode !== "off" ? "text-green-500 opacity-100" : "opacity-70"}`} />
                </div>

                <div className="flex items-center gap-2 sm:gap-5">

                    <p className="text-[9px] sm:text-xs min-w-[28px] sm:min-w-[35px] text-right">
                        {String(time.currentTime.minute).padStart(1, "0")} : {String(time.currentTime.second).padStart(2, "0")}
                    </p>

                    <div ref={seekBg} onClick={seekSong} className="w-[25vw] sm:w-[35vw] md:w-[40vw] lg:w-[60vh] max-w-[500px] bg-gray-300 rounded-full cursor-pointer">
                        <hr ref={seekBar} className="h-1 border-none w-0 bg-green-500 rounded-full" />
                    </div>

                    <p className="text-[9px] sm:text-xs min-w-[28px] sm:min-w-[35px]">
                        {String(time.totalTime.minute).padStart(1, "0")} : {String(time.totalTime.second).padStart(2, "0")}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 opacity-75 w-[15%] sm:w-[20%] lg:w-auto lg:min-w-[220px]">

                <FontAwesomeIcon onClick={toggleNowPlaying} icon={faPlayCircle} className={`w-3 sm:w-4 cursor-pointer hover:text-green-500 ${showNowPlaying ? "text-green-500" : ""}`} />

                <FontAwesomeIcon onClick={toggleQueue} icon={faList} className={`w-3 sm:w-4 cursor-pointer hover:text-green-500 ${showQueue ? "text-green-500" : ""}`} />

                <FontAwesomeIcon onClick={toggleMute} icon={isMuted || volume === 0 ? faVolumeXmark : volume < 0.5 ? faVolumeLow : faVolumeHigh} className={`w-3 sm:w-4 cursor-pointer hover:text-green-500 ${isMuted ? "text-red-500" : ""}`} />

                <div onClick={changeVolume} className="hidden md:block w-16 lg:w-20 h-1 bg-gray-500 rounded-full cursor-pointer relative">
                    <div className="absolute left-0 top-0 h-1 bg-green-500 rounded-full" style={{ width: `${volume * 100}%` }} />
                </div>

                <FontAwesomeIcon onClick={toggleFullscreen} icon={faDisplay} className="hidden md:block w-3 sm:w-4 cursor-pointer hover:text-green-500" />
            </div>

            {showNowPlaying && (
                <div className="fixed bottom-[10%] right-2 sm:right-4 w-[calc(100%-16px)] sm:w-80 bg-[#242424] rounded-lg p-4 sm:p-5 z-50 shadow-xl">

                    <img src={track.image} alt="" className="w-full aspect-square object-cover rounded mb-4" />

                    <div className="flex items-center justify-between gap-3">

                        <div className="min-w-0 flex-1">
                            <p className="text-white font-bold truncate">
                                {track.name}
                            </p>

                            <p className="text-gray-400 text-sm truncate">
                                {track.desc}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <FontAwesomeIcon onClick={previous} icon={faBackwardStep} className="text-white w-4 cursor-pointer hover:text-green-500" />

                            {playStatus ? (
                                <FontAwesomeIcon onClick={pause} icon={faPause} className="text-white w-4 cursor-pointer hover:text-green-500" />
                            ) : (
                                <FontAwesomeIcon onClick={play} icon={faPlay} className="text-white w-4 cursor-pointer hover:text-green-500" />
                            )}

                            <FontAwesomeIcon onClick={next} icon={faForwardStep} className="text-white w-4 cursor-pointer hover:text-green-500" />
                        </div>
                    </div>
                </div>
            )}

            {showQueue && (
                <div className="fixed bottom-[10%] right-2 sm:right-4 w-[calc(100%-16px)] sm:w-80 bg-[#242424] rounded-lg p-4 z-50 shadow-xl">

                    <div className="flex justify-between items-center mb-3">
                        <p className="text-white font-bold text-lg">
                            Queue
                        </p>

                        <p className="text-gray-400 text-xs">
                            {currentQueue.length} Songs
                        </p>
                    </div>

                    {previousTrack && (
                        <div className="mb-2">
                            <p className="text-gray-500 text-xs px-2 mb-1">
                                Previous
                            </p>

                            <QueueSong song={previousTrack} label="Previous" />
                        </div>
                    )}

                    <div className="mb-2">
                        <p className="text-gray-500 text-xs px-2 mb-1">
                            Current
                        </p>

                        <QueueSong song={currentTrack} label="Playing" isCurrent={true} />
                    </div>

                    {nextTrack && (
                        <div>
                            <p className="text-gray-500 text-xs px-2 mb-1">
                                Next
                            </p>

                            <QueueSong song={nextTrack} label="Next" />
                        </div>
                    )}

                    {!previousTrack && !nextTrack && (
                        <p className="text-gray-400 text-sm px-2 py-3">
                            No other songs in queue
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Player;
