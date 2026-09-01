import React, { useState } from "react";
import axios from "axios";
import { url } from "../App.jsx";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

const AddAlbum = () => {
  const [image, setImage] = useState(false);
  const [colour, setColour] = useState("#BF509F");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select album image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("bgColour", colour);

      const response = await axios.post(`${url}/api/album/add`, formData);

      if (response.data.success) {
        toast.success("Album added");

        setName("");
        setDesc("");
        setImage(false);
        setColour("#BF509F");

        const fileInput = document.getElementById("album-image");
        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-[#C8C1B2] border-t-[#2F6B4F] rounded-full animate-spin" />
          <p className="text-sm text-[#557061]">Adding album...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-5 md:px-8 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#173C27] text-center">Add Album</h2>
        <div className="w-12 sm:w-16 h-1 bg-[#2F6B4F] rounded-full mx-auto mt-2" />
        <p className="text-xs sm:text-sm text-[#718477] text-center mt-2">Create a new album and add it to your music library</p>
      </div>

      <form onSubmit={onSubmitHandler} className="w-full bg-white rounded-2xl border border-[#E2E2D8] shadow-sm p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm sm:text-base text-[#173F2B]">Upload Image</p>
          <p className="text-xs text-[#718477]">Choose an image for your album cover</p>

          <input type="file" id="album-image" accept="image/*" hidden onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImage(file);
            }
          }} />

          <label htmlFor="album-image" className="mt-1">
            <div className="w-full max-w-[220px] h-[180px] sm:w-[220px] sm:h-[190px] md:w-[240px] md:h-[200px] rounded-xl bg-[#E8E1D5] border-2 border-dashed border-[#C8C1B2] hover:border-[#2F6B4F] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition mx-auto sm:mx-0">
              {image ? (
                <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Album Preview" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faImage} className="text-3xl sm:text-4xl text-[#2F6B4F] mb-2 sm:mb-3" />
                  <span className="text-xs sm:text-sm text-[#557061]">Upload Image</span>
                  <span className="text-[10px] sm:text-xs text-[#8A958D] mt-1">JPG, PNG, WEBP</span>
                </>
              )}
            </div>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="album-name" className="font-semibold text-sm sm:text-base text-[#173F2B]">Album Name</label>
          <input id="album-name" type="text" onChange={(e) => setName(e.target.value)} value={name} className="w-full h-11 sm:h-12 bg-[#F5F2EA] border border-[#C8C1B2] text-[#173F2B] placeholder-[#7A857D] rounded-lg px-3 sm:px-4 text-sm sm:text-base focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#2F6B4F]/10 focus:outline-none transition" placeholder="Type Album Name Here" required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="album-description" className="font-semibold text-sm sm:text-base text-[#173F2B]">Album Description</label>
          <textarea id="album-description" onChange={(e) => setDesc(e.target.value)} value={desc} rows={4} className="w-full min-h-[110px] sm:min-h-[120px] bg-[#F5F2EA] border border-[#C8C1B2] text-[#173F2B] placeholder-[#7A857D] rounded-lg p-3 sm:p-4 text-sm sm:text-base resize-none focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#2F6B4F]/10 focus:outline-none transition" placeholder="Type Album Description Here" required />
        </div>
        <div className="flex flex-col gap-2 sm:gap-3">
          <p className="font-semibold text-sm sm:text-base text-[#173F2B]">Background Colour</p>
          <div className="flex items-center gap-3 sm:gap-4">
            <input onChange={(e) => setColour(e.target.value)} value={colour} type="color" className="w-12 h-10 sm:w-14 sm:h-10 cursor-pointer rounded-lg border border-[#C8C1B2] bg-white p-0.5" />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F2EA] border border-[#D8D1C4]">
              <span className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: colour }} />
              <span className="font-medium text-xs sm:text-sm text-[#173F2B] uppercase">{colour}</span>
            </div>
          </div>
        </div>
        <div className="pt-1 sm:pt-2">
          <button type="submit" className="w-full sm:w-auto min-w-[160px] bg-[#2F6B4F] text-white font-semibold rounded-lg py-3 px-8 sm:px-12 text-sm sm:text-base cursor-pointer hover:bg-[#24543D] active:scale-[0.98] transition">
            Add Album
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAlbum;