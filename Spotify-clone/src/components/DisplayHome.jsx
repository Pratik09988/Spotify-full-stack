import React, { useState, useContext } from "react";
import Navbar from "./Navbar";
import Albumitem from "./Albumitem";
import Songitem from "./Songitem";
import Artistitem from "./Artistitem";
import { PlayerContext } from "../context/PlayerContext";

const DisplayHome = () => {
    const { songsData, albumsData, artistsData } = useContext(PlayerContext);
    const [activeFilter, setActiveFilter] = useState("all");

    return (
        <>
            <Navbar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

            <div className="w-full flex gap-2 items-center mt-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <p onClick={() => setActiveFilter("all")} className={`px-4 py-1 rounded-2xl cursor-pointer flex-shrink-0 ${activeFilter === "all" ? "bg-white text-black" : "bg-black text-white"}`}>
                    All
                </p>
                <p onClick={() => setActiveFilter("music")} className={`px-4 py-1 rounded-2xl cursor-pointer flex-shrink-0 ${activeFilter === "music" ? "bg-white text-black" : "bg-black text-white"}`}>
                    Music
                </p>
                <p onClick={() => setActiveFilter("albums")} className={`px-4 py-1 rounded-2xl cursor-pointer flex-shrink-0 ${activeFilter === "albums" ? "bg-white text-black" : "bg-black text-white"}`}>
                    Albums
                </p>
                <p onClick={() => setActiveFilter("artists")} className={`px-4 py-1 rounded-2xl cursor-pointer flex-shrink-0 ${activeFilter === "artists" ? "bg-white text-black" : "bg-black text-white"}`}>
                    Artists
                </p>
            </div>

            {(activeFilter === "all" || activeFilter === "albums") && (
                <div className="mb-4 min-w-0 w-full">
                    <h1 className="my-5 font-bold text-2xl">
                        Featured Charts
                    </h1>
                    <div className="flex overflow-x-auto overflow-y-hidden w-full pb-2 scrollbar-hide">
                        {albumsData.map((item) => (
                            <Albumitem key={item._id} id={item._id} name={item.name} desc={item.desc} image={item.image} />
                        ))}
                    </div>
                </div>
            )}

            {(activeFilter === "all" || activeFilter === "music") && (
                <div className="mb-4 min-w-0 w-full">
                    <h1 className="my-5 font-bold text-2xl">
                        Today's Biggest Hits
                    </h1>
                    <div className="flex overflow-x-auto overflow-y-hidden w-full pb-2 scrollbar-hide">
                        {songsData.map((item) => (
                            <Songitem key={item._id} id={item._id} name={item.name} desc={item.desc} image={item.image} />
                        ))}
                    </div>
                </div>
            )}

            {(activeFilter === "all" || activeFilter === "artists") && (
                <div className="mb-4 min-w-0 w-full">
                    <h1 className="my-5 font-bold text-2xl">
                        Popular Artists
                    </h1>
                    <div className="flex overflow-x-auto overflow-y-hidden w-full pb-2 scrollbar-hide">
                        {artistsData.map((item) => (
                            <Artistitem key={item._id} id={item._id} name={item.name} desc={item.desc} image={item.image} />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default DisplayHome;
