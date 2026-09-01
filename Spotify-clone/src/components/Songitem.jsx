import React, { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";

const Songitem = ({ name, image, desc, id }) => {
    const { playWithId } = useContext(PlayerContext);

    return (
        <div onClick={() => playWithId(id)} className="cursor-pointer w-[calc(50vw-24px)] min-w-[calc(50vw-24px)] sm:min-w-[180px] sm:w-auto p-2 px-3 rounded hover:bg-[#ffffff26]">
            <img className="rounded w-full aspect-square object-cover" src={image} alt={name} />
            <p className="font-bold mt-2 mb-1 truncate">{name}</p>
            <p className="text-slate-400 text-sm truncate">{desc}</p>
        </div>
    );
};

export default Songitem;
