import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGauge, faMusic, faPlus, faList, faRecordVinyl, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { assets } from "../assets/assets";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: "/dashboard", icon: faGauge, label: "Dashboard" },
        { path: "/add-song", icon: faMusic, label: "Add Song" },
        { path: "/list-song", icon: faList, label: "List Song" },
        { path: "/add-album", icon: faPlus, label: "Add Album" },
        { path: "/list-album", icon: faList, label: "List Album" },
        { path: "/add-artist", icon: faRecordVinyl, label: "Add Artist" },
        { path: "/list-artist", icon: faList, label: "List Artist" }
    ];

    const handleMenuClick = (path) => {
        if (location.pathname === path) {
            window.location.reload();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin");
        navigate("/login", {
            replace: true
        });
    };

    return (
        <>
            <aside className="hidden lg:flex w-[220px] xl:w-[235px] min-h-screen bg-[#063B1A] text-white flex-col px-4 py-5 shrink-0">
                <div className="flex justify-center mb-2">
                    <img src={assets.logo} alt="Spotify" className="w-[120px] xl:w-[135px] object-contain" />
                </div>

                <nav className="flex flex-col gap-1.5 mt-4 pt-2">
                    {menuItems.map((item, index) => (
                        <React.Fragment key={item.path}>
                            {index === 1 && <div className="border-t border-white/10 my-3" />}
                            <NavLink to={item.path} onClick={() => handleMenuClick(item.path)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${isActive ? "bg-[#8FCB9B] text-[#063B1A] shadow-sm" : "text-[#E8F2E8] hover:bg-[#0B4A23]"}`}>
                                <FontAwesomeIcon icon={item.icon} className="w-4" />
                                <span>{item.label}</span>
                            </NavLink>
                        </React.Fragment>
                    ))}
                </nav>

                <div className="border-t border-white/10 mt-auto pt-4">
                    <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#3A211C] text-[#FF9B91] text-[14px] font-medium hover:bg-[#4A2923] transition cursor-pointer">
                        <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#063B1A] border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.25)] px-1 sm:px-3 py-2">
                <div className="w-full flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                    {menuItems.map((item) => (
                        <NavLink key={item.path} to={item.path} onClick={() => handleMenuClick(item.path)} className={({ isActive }) => `flex flex-col items-center justify-center shrink-0 w-[62px] sm:w-[76px] min-h-[52px] sm:min-h-[58px] rounded-xl transition-all ${isActive ? "bg-[#8FCB9B] text-[#063B1A]" : "text-[#E8F2E8] hover:bg-[#0B4A23]"}`}>
                            <FontAwesomeIcon icon={item.icon} className="text-sm sm:text-base mb-1" />
                            <span className="text-[8px] sm:text-[10px] font-medium whitespace-nowrap">{item.label}</span>
                        </NavLink>
                    ))}
                    <button type="button" onClick={handleLogout} className="flex flex-col items-center justify-center shrink-0 w-[62px] sm:w-[76px] min-h-[52px] sm:min-h-[58px] rounded-xl bg-[#3A211C] text-[#FF9B91] hover:bg-[#4A2923] transition cursor-pointer">
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-sm sm:text-base mb-1" />
                        <span className="text-[8px] sm:text-[10px] font-medium">Logout</span>
                    </button>
                </div>
            </nav>
        </>
    );
};  

export default Sidebar;