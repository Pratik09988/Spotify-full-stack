import {createContext,useEffect,useRef,useState} from "react";
import axios from "axios";
export const PlayerContext=createContext();
const PlayerContextProvider=(props)=>{
    const audioRef=useRef(null);
    const seekBg=useRef(null);
    const seekBar=useRef(null);
    const url="https://spotify-backend-lmvw.onrender.com";
    const [songsData,setSongsData]=useState([]);
    const [albumsData,setAlbumsData]=useState([]);
    const [artistsData,setArtistsData]=useState([]);
    const [track,setTrack]=useState(null);
    const [playStatus,setPlayStatus]=useState(false);
    const [hasStartedPlaying,setHasStartedPlaying]=useState(false);
    const [currentQueue,setCurrentQueue]=useState([]);
    const [shuffle,setShuffle]=useState(false);
    const [repeatMode,setRepeatMode]=useState("off");
    const [showNowPlaying,setShowNowPlaying]=useState(false);
    const [showQueue,setShowQueue]=useState(false);
    const [isMuted,setIsMuted]=useState(false);
    const [volume,setVolume]=useState(1);
    const [isFullscreen,setIsFullscreen]=useState(false);
    const [time,setTime]=useState({currentTime:{second:0,minute:0},totalTime:{second:0,minute:0}});

    const play=async()=>{
        if(!audioRef.current||!track)return;
        try{
            await audioRef.current.play();
            setPlayStatus(true);
            setHasStartedPlaying(true);
        }catch(error){
            console.log(error);
        }
    };

    const pause=()=>{
        if(!audioRef.current)return;
        audioRef.current.pause();
        setPlayStatus(false);
    };

    const playWithId=(id,albumSongs=songsData)=>{
        const song=albumSongs.find((item)=>item._id===id);
        if(!song)return;
        setCurrentQueue(albumSongs);
        setHasStartedPlaying(true);
        if(track?._id===song._id){
            play();
        }else{
            setTrack(song);
            setPlayStatus(true);
        }
    };

    const previous=()=>{
        if(!track||currentQueue.length===0)return;
        const index=currentQueue.findIndex((item)=>item._id===track._id);
        if(index>0){
            setTrack(currentQueue[index-1]);
            setPlayStatus(true);
        }else if(repeatMode==="all"){
            setTrack(currentQueue[currentQueue.length-1]);
            setPlayStatus(true);
        }
    };

    const next=()=>{
        if(!track||currentQueue.length===0)return;
        if(repeatMode==="one"){
            if(audioRef.current){
                audioRef.current.currentTime=0;
                audioRef.current.play().catch((error)=>console.log(error));
            }
            setPlayStatus(true);
            return;
        }
        if(shuffle){
            if(currentQueue.length===1)return;
            const currentIndex=currentQueue.findIndex((item)=>item._id===track._id);
            let randomIndex;
            do{
                randomIndex=Math.floor(Math.random()*currentQueue.length);
            }while(randomIndex===currentIndex);
            setTrack(currentQueue[randomIndex]);
            setPlayStatus(true);
            return;
        }
        const index=currentQueue.findIndex((item)=>item._id===track._id);
        if(index<currentQueue.length-1){
            setTrack(currentQueue[index+1]);
            setPlayStatus(true);
        }else if(repeatMode==="all"){
            setTrack(currentQueue[0]);
            setPlayStatus(true);
        }else{
            setPlayStatus(false);
        }
    };

    const toggleShuffle=()=>{
        setShuffle((prev)=>!prev);
    };

    const toggleRepeat=()=>{
        setRepeatMode((prev)=>{
            if(prev==="off")return "all";
            if(prev==="all")return "one";
            return "off";
        });
    };

    const handleSongEnd=()=>{
        next();
    };

    const seekSong=(e)=>{
        if(!audioRef.current||!seekBg.current||!audioRef.current.duration)return;
        const rect=seekBg.current.getBoundingClientRect();
        const clickPosition=e.clientX-rect.left;
        const percentage=Math.min(1,Math.max(0,clickPosition/rect.width));
        audioRef.current.currentTime=percentage*audioRef.current.duration;
    };

    const toggleNowPlaying=()=>{
        setShowNowPlaying((prev)=>!prev);
        setShowQueue(false);
    };

    const toggleQueue=()=>{
        setShowQueue((prev)=>!prev);
        setShowNowPlaying(false);
    };

    const closePlayerPanels=()=>{
        setShowNowPlaying(false);
        setShowQueue(false);
    };

    const toggleMute=()=>{
        if(!audioRef.current)return;
        if(audioRef.current.muted){
            audioRef.current.muted=false;
            setIsMuted(false);
        }else{
            audioRef.current.muted=true;
            setIsMuted(true);
        }
    };

    const changeVolume=(e)=>{
        if(!audioRef.current)return;
        const rect=e.currentTarget.getBoundingClientRect();
        const newVolume=Math.min(1,Math.max(0,(e.clientX-rect.left)/rect.width));
        audioRef.current.volume=newVolume;
        if(newVolume===0){
            audioRef.current.muted=true;
            setIsMuted(true);
        }else{
            audioRef.current.muted=false;
            setIsMuted(false);
        }
        setVolume(newVolume);
    };

    const toggleFullscreen=async()=>{
        try{
            if(!document.fullscreenElement){
                await document.documentElement.requestFullscreen();
            }else{
                await document.exitFullscreen();
            }
        }catch(error){
            console.log(error);
        }
    };

    const getSongsData=async()=>{
        try{
            const response=await axios.get(`${url}/api/song/list`);
            const songs=response.data.songs||[];
            setSongsData(songs);
            setCurrentQueue(songs);
            setTrack(null);
        }catch(error){
            console.log(error);
        }
    };

    const getAlbumsData=async()=>{
        try{
            const response=await axios.get(`${url}/api/album/list`);
            setAlbumsData(response.data.albums||[]);
        }catch(error){
            console.log(error);
        }
    };

    const getArtistsData=async()=>{
        try{
            const response=await axios.get(`${url}/api/artist/list`);
            setArtistsData(response.data.artists||[]);
        }catch(error){
            console.log(error);
        }
    };

    useEffect(()=>{
        getSongsData();
        getAlbumsData();
        getArtistsData();
    },[]);

    useEffect(()=>{
        if(!track||!audioRef.current)return;
        audioRef.current.src=track.file;
        audioRef.current.load();
        audioRef.current.volume=volume;
        audioRef.current.muted=isMuted;
        if(playStatus){
            audioRef.current.play().catch((error)=>console.log(error));
        }
    },[track]);

    useEffect(()=>{
        if(!audioRef.current)return;
        const audio=audioRef.current;
        const updateTime=()=>{
            if(!audio.duration)return;
            if(seekBar.current){
                seekBar.current.style.width=Math.floor((audio.currentTime/audio.duration)*100)+"%";
            }
            setTime({currentTime:{second:Math.floor(audio.currentTime%60),minute:Math.floor(audio.currentTime/60)},totalTime:{second:Math.floor(audio.duration%60),minute:Math.floor(audio.duration/60)}});
        };
        audio.ontimeupdate=updateTime;
        audio.onended=handleSongEnd;
        return()=>{
            audio.ontimeupdate=null;
            audio.onended=null;
        };
    },[shuffle,repeatMode,currentQueue,track]);

    useEffect(()=>{
        const handleFullscreenChange=()=>{
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange",handleFullscreenChange);
        return()=>{
            document.removeEventListener("fullscreenchange",handleFullscreenChange);
        };
    },[]);

    const contextValue={audioRef,seekBg,seekBar,seekSong,track,setTrack,playStatus,setPlayStatus,play,pause,playWithId,previous,next,time,setTime,songsData,albumsData,artistsData,currentQueue,shuffle,toggleShuffle,repeatMode,toggleRepeat,hasStartedPlaying,showNowPlaying,toggleNowPlaying,showQueue,toggleQueue,closePlayerPanels,isMuted,volume,toggleMute,changeVolume,isFullscreen,toggleFullscreen};
    return <PlayerContext.Provider value={contextValue}>{props.children}</PlayerContext.Provider>;
};

export default PlayerContextProvider;
