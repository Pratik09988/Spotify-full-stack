import axios from "axios";
import React, { useEffect, useState } from "react";
import { url } from "../App";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const ListAlbum = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/album/list`);
      if (response.data.success) {
        setData(response.data.albums || []);
      } else {
        toast.error(response.data.message || "Unable to load albums");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeAlbum = async (id) => {
    try {
      const response = await axios.post(`${url}/api/album/remove`, { id });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAlbums();
      } else {
        toast.error(response.data.message || "Unable to remove album");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error occurred");
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="w-10 h-10 border-4 border-[#C8C1B2] border-t-[#2F6B4F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <h2 className="text-lg sm:text-xl font-semibold text-center text-[#173C27] mb-4 underline">All Album List</h2>
      {data.length === 0 ? (
        <div className="bg-[#FFFDF7] border border-[#D9DED6] rounded-xl p-8 text-center text-[#68766E]">No albums found</div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto bg-[#FFFDF7] rounded-xl border border-[#D9DED6] shadow-sm">
            <div className="min-w-[760px] grid grid-cols-[80px_1.1fr_2fr_1.2fr_70px] items-center gap-3 px-4 py-4 bg-[#DCECDD] text-[#173C27] text-sm font-semibold">
              <b>Image</b>
              <b>Name</b>
              <b>Description</b>
              <b>Colour</b>
              <b>Action</b>
            </div>
            {data.map((item) => (
              <div key={item._id} className="min-w-[760px] grid grid-cols-[80px_1.1fr_2fr_1.2fr_70px] items-center gap-3 px-4 py-3 border-t border-[#E1E5DF] text-sm text-[#274433] hover:bg-[#F5F8F1] transition">
                <img className="w-12 h-12 object-cover rounded-lg" src={item.image} alt={item.name} />
                <p className="font-medium truncate">{item.name}</p>
                <p className="truncate" title={item.desc}>{item.desc}</p>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-lg border border-[#CCD4CC] shrink-0" style={{ backgroundColor: item.bgColour }} />
                  <span className="text-xs truncate">{item.bgColour}</span>
                </div>
                <button type="button" onClick={() => removeAlbum(item._id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-[#D95C52] border border-red-200 hover:bg-red-50 transition">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-3">
            {data.map((item) => (
              <div key={item._id} className="bg-[#FFFDF7] border border-[#D9DED6] rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#173C27] truncate">{item.name}</p>
                    <p className="text-xs text-[#68766E] mt-1 line-clamp-3">{item.desc}</p>
                  </div>
                  <button type="button" onClick={() => removeAlbum(item._id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-red-600 border border-red-200 hover:bg-red-50 shrink-0">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#E5E8E3]">
                  <div className="w-8 h-8 rounded-lg border border-[#CCD4CC]" style={{ backgroundColor: item.bgColour }} />
                  <div>
                    <p className="text-[10px] text-[#718477]">Background Colour</p>
                    <p className="text-xs font-medium text-[#274433]">{item.bgColour}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ListAlbum;