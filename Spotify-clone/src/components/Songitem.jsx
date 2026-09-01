import React, { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";

const Songitem = ({ name, image, desc, id }) => {
    const { playWithId } = useContext(PlayerContext);

    return (
        <div onClick={() => playWithId(id)} className="cursor-pointer min-w-[180px] p-2 px-3 rounded hover:bg-[#ffffff26]">
            <img className="rounded" src={image} alt={name} />
            <p className="font-bold mt-2 mb-1">{name}</p>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    );
};

export default Songitem;
