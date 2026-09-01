import React, { useState } from "react";
import axios from "axios";
import { assets } from "../assets/assets.js";
import { Link, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import backlogin from "../assets/backlogin.png";

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        gender: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        if (name === "password" && value === "") {
            setShowPassword(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const mobile = formData.mobile.trim();
        const password = formData.password.trim();

        if (!name || !email || !mobile || !formData.gender || !password) {
            alert("All fields are required");
            return;
        }

        if (!/^\d{10}$/.test(mobile)) {
            alert("Mobile number must contain exactly 10 digits");
            return;
        }

        try {
            const response = await axios.post(
                "https://spotify-backend-lmvw.onrender.com/api/user/register",
                {
                    name,
                    email,
                    mobile,
                    gender: formData.gender,
                    password
                }
            );

            console.log("REGISTER RESPONSE:", response.data);

            if (response.data.success) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                navigate("/");
            } else {
                alert(response.data.message || "Registration failed");
            }
        } catch (error) {
            console.log("REGISTER ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backlogin})` }}
        >
            <div className="absolute inset-0 bg-black/35">
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15),rgba(0,0,0,0.55))]">
            </div>

            <div className="relative z-10 w-full max-w-[390px] bg-[#0e0e0e]/95 border border-white/10 rounded-2xl px-8 py-8 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-[3px]">
                <div className="flex justify-center mb-4">
                    <img src={assets.spotify_logo} alt="Spotify" className="w-[48px] h-[48px] object-contain"/>
                </div>

                <h1 className="text-white text-[28px] font-bold text-center">
                    Create Account
                </h1>

                <p className="text-[#8f8f8f] text-[14px] text-center mt-1 mb-6">
                    Create your account to continue listening
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="relative">
                        <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-[#888] text-[13px]">
                        </i>

                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full h-[43px] bg-[#1a1a1a] border border-[#303030] text-white text-[14px] pl-11 pr-4 rounded-lg outline-none placeholder:text-[#777] focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition"/>
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-[#888] text-[13px]">
                        </i>

                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full h-[43px] bg-[#1a1a1a] border border-[#303030] text-white text-[14px] pl-11 pr-4 rounded-lg outline-none placeholder:text-[#777] focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition"/>
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-[#888] text-[13px]">
                        </i>

                        <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" maxLength={10} inputMode="numeric" className="w-full h-[43px] bg-[#1a1a1a] border border-[#303030] text-white text-[14px] pl-11 pr-4 rounded-lg outline-none placeholder:text-[#777] focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition"/>
                    </div>

                    <div className="mt-1">
                        <p className="text-[12px] text-[#8f8f8f] mb-2">
                            Gender
                        </p>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 text-[13px] text-[#ddd] cursor-pointer">
                                <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} className="accent-green-500 w-3.5 h-3.5 cursor-pointer"/>
                                Male
                            </label>

                            <label className="flex items-center gap-2 text-[13px] text-[#ddd] cursor-pointer">
                                <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} className="accent-green-500 w-3.5 h-3.5 cursor-pointer"/>
                                Female
                            </label>
                        </div>
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#888] text-[13px]">
                        </i>

                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full h-[43px] bg-[#1a1a1a] border border-[#303030] text-white text-[14px] pl-11 pr-11 rounded-lg outline-none placeholder:text-[#777] focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition"/>

                        {formData.password.length > 0 && (
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777] hover:text-white transition cursor-pointer">
                                <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}>
                                </i>
                            </button>
                        )}
                    </div>

                    <button type="submit" className="w-full h-[43px] bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold text-[14px] rounded-full transition duration-200 active:scale-[0.98] cursor-pointer mt-1">
                        Sign Up
                    </button>
                </form>

                <p className="text-[#8f8f8f] text-[13px] text-center mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-white hover:text-green-500 transition font-medium">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
