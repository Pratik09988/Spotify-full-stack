import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import DisplayAlbum from "./components/DisplayAlbum";
import DisplayArtist from "./components/DisplayArtist";
import Display from "./components/Display";
import Player from "./components/Player";
import Sidebar from "./components/Sidebar";
import Search from "./components/Search";
import Playlist from "./components/Playlist";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Favorite from "./components/Favorite";
import { PlayerContext } from "./context/PlayerContext";
import ProtectedRoute from "./components/ProtectedRoute";

export const url = "http://localhost:4000";

function App() {
    const { audioRef, songsData, hasStartedPlaying } = useContext(PlayerContext);

    return (
        <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/"element={
                        <div className="h-screen bg-black">
                            <div className={hasStartedPlaying ? "h-[90%] flex" : "h-full flex"}>
                                <Sidebar />
                                <Display />
                            </div>
                            {hasStartedPlaying && <Player />}
                            <audio ref={audioRef}></audio>
                        </div>
                    }
                />
                <Route path="/search"element={
                        <div className="h-screen bg-black">
                            <div className={hasStartedPlaying ? "h-[90%] flex" : "h-full flex"}>
                                <Sidebar />
                                <div className="flex-1 min-w-0 h-full overflow-y-auto">
                                    <Search />
                                </div>
                            </div>
                            {hasStartedPlaying && <Player />}
                            <audio ref={audioRef}></audio>
                        </div>
                    }
                />
                <Route path="/album/:id"element={
                        <div className="h-screen text-white bg-black">
                            <div className={hasStartedPlaying ? "h-[90%] flex" : "h-full flex"}>
                                <Sidebar />
                                <div className="flex-1 min-w-0 h-full overflow-y-auto">
                                    <DisplayAlbum />
                                </div>
                            </div>
                            {hasStartedPlaying && <Player />}
                            <audio ref={audioRef}></audio>
                        </div>
                    }
                />
                <Route path="/artist/:id"element={
                        <div className="h-screen text-white bg-black">
                            <div className={hasStartedPlaying ? "h-[90%] flex" : "h-full flex"}>
                                <Sidebar />
                                <div className="flex-1 min-w-0 h-full overflow-y-auto">
                                    <DisplayArtist />
                                </div>
                            </div>
                            {hasStartedPlaying && <Player />}
                            <audio ref={audioRef}></audio>
                        </div>
                    }
                />
                <Route path="/profile"element={songsData.length !== 0 ? (
                            <div className="h-screen bg-black">
                                <div className={hasStartedPlaying ? "h-[90%] flex" : "h-full flex"}>
                                    <Sidebar />
                                    <Profile />
                                </div>
                                {hasStartedPlaying && <Player />}
                                <audio ref={audioRef}></audio>
                            </div>
                        ) : null
                    }
                />
                <Route path="/favorites"element={
                        <div className="h-screen bg-black">
                            <div className={hasStartedPlaying ? "h-[90%] flex" : "h-full flex"}>
                                <Sidebar />
                                <div className="flex-1 min-w-0 h-full overflow-y-auto">
                                    <Favorite />
                                </div>
                            </div>
                            {hasStartedPlaying && <Player />}
                            <audio ref={audioRef}></audio>
                        </div>
                    }
                />
                <Route path="/playlist/:id"element={
                        <div className="h-screen bg-black">
                            <div className={hasStartedPlaying ? "h-[90%] flex" : "h-full flex"}>
                                <Sidebar />
                                <div className="flex-1 min-w-0 h-full overflow-y-auto">
                                    <Playlist />
                                </div>
                            </div>
                            {hasStartedPlaying && <Player />}
                            <audio ref={audioRef}></audio>
                        </div>
                    }
                />
            </Route>
        </Routes>
    );
}
export default App;