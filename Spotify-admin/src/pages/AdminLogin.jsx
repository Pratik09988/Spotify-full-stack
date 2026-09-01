import React, { useState } from "react";
import axios from "axios";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import backlogin from "../assets/backlogin.png";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:4000/api/admin/login", formData);

            if (response.data.success) {
                localStorage.setItem("admin", JSON.stringify(response.data.admin));
                navigate("/dashboard");
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log(error);
            alert("Admin login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backlogin})` }}>
            <div className="absolute inset-0 bg-black/35"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15),rgba(0,0,0,0.55))]"></div>

            <div className="relative z-10 w-full max-w-[390px] bg-[#0e0e0e]/95 border border-white/10 rounded-2xl px-8 py-8 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-[3px]">
                <div className="flex justify-center mb-5">
                    <img src={assets.logo_small} alt="Spotify" className="w-[55px] h-[55px] object-contain" />
                </div>

                <h1 className="text-white text-[26px] font-bold text-center">
                    Welcome Back
                </h1>

                <p className="text-[#999] text-[14px] text-center mt-1 mb-7">
                    Login to Spotify Admin
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="relative">
                        <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-[#888] text-[13px]"></i>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Admin Username" required className="w-full h-[43px] bg-[#1a1a1a] border border-[#303030] text-white text-[14px] pl-11 pr-4 rounded-lg outline-none placeholder:text-[#777] focus:border-green-500" />
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#888] text-[13px]"></i>
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="w-full h-[43px] bg-[#1a1a1a] border border-[#303030] text-white text-[14px] pl-11 pr-11 rounded-lg outline-none placeholder:text-[#777] focus:border-green-500" />

                        {formData.password.length > 0 && (
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777] hover:text-white">
                                <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} />
                            </button>
                        )}
                    </div>

                    <label className="flex items-center gap-2 text-[#999] text-[12px] cursor-pointer mt-1">
                        <input type="checkbox" className="w-[13px] h-[13px] accent-[#1ed760] cursor-pointer" />
                        Remember me
                    </label>

                    <button type="submit" className="w-full h-[43px] bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold text-[14px] rounded-full transition cursor-pointer mt-2">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;