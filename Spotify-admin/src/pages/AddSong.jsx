import React, { useEffect, useState } from "react";
import axios from "axios";
import { url } from "../App.jsx";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faImage } from "@fortawesome/free-solid-svg-icons";

const AddSong = () => {
  const [image, setImage] = useState(false);
  const [song, setSong] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [album, setAlbum] = useState("none");
  const [artist, setArtist] = useState("none");
  const [loading, setLoading] = useState(false);
  const [albumData, setAlbumData] = useState([]);
  const [artistData, setArtistData] = useState([]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!song) {
      toast.error("Please select a song");
      return;
    }
    if (!image) {
      toast.error("Please select song image");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("audio", song);
      if (album !== "none") {
        formData.append("album", album);
      } else {
        formData.append("album", "");
      }
      if (artist !== "none") {
        formData.append("artist", artist);
      } else {
        formData.append("artist", "");
      }
      const response = await axios.post(`${url}/api/song/add`, formData);
      if (response.data.success) {
        toast.success("Song Added");
        setName("");
        setDesc("");
        setAlbum("none");
        setArtist("none");
        setImage(false);
        setSong(false);
        const songInput = document.getElementById("song");
        const imageInput = document.getElementById("image");
        if (songInput) songInput.value = "";
        if (imageInput) imageInput.value = "";
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

  const loadAlbumData = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list`);
      if (response.data.success) {
        setAlbumData(response.data.albums || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message || "Unable to load albums");
    }
  };

  const loadArtistData = async () => {
    try {
      const response = await axios.get(`${url}/api/artist/list`);
      if (response.data.success) {
        setArtistData(response.data.artists || []);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message || "Unable to load artists");
    }
  };

  useEffect(() => {
    loadAlbumData();
    loadArtistData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-[#C8C1B2] border-t-[#2F6B4F] rounded-full animate-spin" />
          <p className="text-sm text-[#557061]">Adding song...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-5 md:px-8 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#173C27] text-center">Add Song</h2>
        <div className="w-12 sm:w-16 h-1 bg-[#2F6B4F] rounded-full mx-auto mt-2" />
        <p className="text-xs sm:text-sm text-[#718477] text-center mt-2">Upload a new song and add it to your music library</p>
      </div>
      <form onSubmit={onSubmitHandler} className="w-full bg-white rounded-2xl border border-[#E2E2D8] shadow-sm p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 text-[#173F2B]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-sm sm:text-base">Upload Song</p>
            <p className="text-xs text-[#718477]">MP3, WAV or M4A audio file</p>
            <input type="file" id="song" accept=".mp3,.wav,.m4a,audio/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) setSong(file); }} />
            <label htmlFor="song">
              <div className="w-full h-[180px] sm:h-[190px] md:h-[200px] rounded-xl bg-[#E8E1D5] border-2 border-dashed border-[#C8C1B2] hover:border-[#2F6B4F] flex flex-col items-center justify-center cursor-pointer transition px-4 text-center">
                <FontAwesomeIcon icon={faMusic} className="text-3xl sm:text-4xl text-[#2F6B4F] mb-3" />
                {song ? (
                  <>
                    <p className="text-xs sm:text-sm font-semibold text-[#173F2B] truncate w-full" title={song.name}>{song.name}</p>
                    <p className="text-[11px] sm:text-xs text-[#557061] mt-1">{(song.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-[10px] sm:text-xs text-[#2F6B4F] mt-2">Click to change</p>
                  </>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm text-[#557061]">Upload Music</span>
                    <span className="text-[10px] sm:text-xs text-[#8A958D] mt-1">Click to browse</span>
                  </>
                )}
              </div>
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-sm sm:text-base">Upload Song Image</p>
            <p className="text-xs text-[#718477]">Choose a cover image</p>
            <input type="file" id="image" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) setImage(file); }} />
            <label htmlFor="image">
              <div className="w-full h-[180px] sm:h-[190px] md:h-[200px] rounded-xl bg-[#E8E1D5] border-2 border-dashed border-[#C8C1B2] hover:border-[#2F6B4F] flex flex-col items-center justify-center cursor-pointer transition overflow-hidden">
                {image ? (
                  <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Song Preview" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faImage} className="text-3xl sm:text-4xl text-[#2F6B4F] mb-3" />
                    <span className="text-xs sm:text-sm text-[#557061]">Upload Image</span>
                    <span className="text-[10px] sm:text-xs text-[#8A958D] mt-1">JPG, PNG, WEBP</span>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="song-name" className="font-semibold text-sm sm:text-base">Song Name</label>
          <input id="song-name" type="text" onChange={(e) => setName(e.target.value)} value={name} className="w-full h-11 sm:h-12 bg-[#F5F2EA] border border-[#C8C1B2] text-[#173F2B] placeholder-[#7A857D] rounded-lg px-3 sm:px-4 text-sm sm:text-base focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#2F6B4F]/10 focus:outline-none transition" placeholder="Type Song Name Here" required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="song-description" className="font-semibold text-sm sm:text-base">Song Description</label>
          <textarea id="song-description" onChange={(e) => setDesc(e.target.value)} value={desc} rows={4} className="w-full min-h-[110px] sm:min-h-[120px] bg-[#F5F2EA] border border-[#C8C1B2] text-[#173F2B] placeholder-[#7A857D] rounded-lg p-3 sm:p-4 text-sm sm:text-base resize-none focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#2F6B4F]/10 focus:outline-none transition" placeholder="Type Song Description Here" required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="album" className="font-semibold text-sm sm:text-base">Album</label>
          <select id="album" onChange={(e) => setAlbum(e.target.value)} value={album} className="w-full h-11 sm:h-12 bg-[#F5F2EA] border border-[#C8C1B2] text-[#173F2B] rounded-lg px-3 sm:px-4 text-sm sm:text-base focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#2F6B4F]/10 focus:outline-none transition">
            <option value="none">None</option>
            {albumData.map((item) => (
              <option key={item._id} value={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="artist" className="font-semibold text-sm sm:text-base">Artist</label>
          <select id="artist" onChange={(e) => setArtist(e.target.value)} value={artist} className="w-full h-11 sm:h-12 bg-[#F5F2EA] border border-[#C8C1B2] text-[#173F2B] rounded-lg px-3 sm:px-4 text-sm sm:text-base focus:border-[#2F6B4F] focus:ring-2 focus:ring-[#2F6B4F]/10 focus:outline-none transition">
            <option value="none">None</option>
            {artistData.map((item) => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="pt-1 sm:pt-2">
          <button type="submit" className="w-full sm:w-auto min-w-[160px] bg-[#2F6B4F] text-white font-semibold rounded-lg py-3 px-8 sm:px-12 text-sm sm:text-base cursor-pointer hover:bg-[#24543D] active:scale-[0.98] transition">Add Song</button>
        </div>
      </form>
    </div>
  );
};

export default AddSong;