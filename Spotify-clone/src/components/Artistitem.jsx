import React from "react";
import { useNavigate } from "react-router-dom";

const Artistitem = ({ name, image, desc, id }) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/artist/${id}`)} className="cursor-pointer min-w-[180px] p-2 px-3 rounded hover:bg-[#ffffff26]">
            <img className="rounded" src={image} alt={name} />
            <p className="font-bold mt-2 mb-1">{name}</p>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    );
};

export default Artistitem;
