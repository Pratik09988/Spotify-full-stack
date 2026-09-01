import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import backlogin from "../assets/backlogin.png";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Login = () => {
    const navigate = useNavigate();

    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const loginUser = async (e) => {
        e.preventDefault();

        if (mobile === "" || password === "") {
            alert("Please enter mobile number and password");
            return;
        }

        try {
            const result = await axios.post(
                "https://spotify-backend-lmvw.onrender.com/api/user/login",
                {
                    mobile: mobile,
                    password: password
                }
            );

            if (result.data.success) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(result.data.user)
                );

                navigate("/");
            } else {
                alert(result.data.message);
            }
        } catch (error) {
            console.log(error);

            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Something went wrong");
            }
        }
    };

    return (
        <div
            className="min-h-screen flex justify-center items-center bg-cover bg-center px-4"
            style={{ backgroundImage: `url(${backlogin})` }}>
            <div className="bg-black/90 p-8 rounded-2xl w-full max-w-[390px]">

                <div className="flex justify-center mb-5">
                    <img
                        src={assets.spotify_logo}
                        alt="Spotify"
                        className="w-12"
                    />
                </div>

                <h1 className="text-white text-3xl font-bold text-center">
                    Welcome Back
                </h1>

                <p className="text-gray-400 text-center mt-2 mb-6">
                    Login to continue listening
                </p>

                <form onSubmit={loginUser}>
                    <div className="relative mb-4">
                        <i className="fa-solid fa-phone absolute left-4 top-4 text-gray-500"></i>
                        <input type="tel"placeholder="Mobile Number"value={mobile}onChange={(e) => setMobile(e.target.value)}maxLength={10}className="w-full h-11 bg-[#1a1a1a] text-white rounded-lg pl-11 pr-4 outline-none"/>
                    </div>

                    <div className="relative mb-4">
                        <i className="fa-solid fa-lock absolute left-4 top-4 text-gray-500"></i>

                        <input type={showPassword ? "text" : "password"}placeholder="Password"value={password}onChange={(e) => setPassword(e.target.value)}className="w-full h-11 bg-[#1a1a1a] text-white rounded-lg pl-11 pr-11 outline-none"/>

                        {password.length > 0 && (
                            <button type="button"onClick={() => setShowPassword(!showPassword)}className="absolute right-4 top-3 text-gray-500">
                                <i
                                    className={
                                        showPassword
                                            ? "fa-solid fa-eye-slash"
                                            : "fa-solid fa-eye"
                                    }
                                ></i>
                            </button>
                        )}
                    </div>

                    <div className="flex justify-between text-xs mb-5">
                        <label className="text-gray-400">
                            <input type="checkbox"className="mr-2"/>
                            Remember me
                        </label>

                        <Link to="/forgot-password"className="text-green-500">
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit"className="w-full h-11 bg-green-500 rounded-full font-bold">
                        Login
                    </button>
                </form>

                <p className="text-gray-400 text-center text-sm mt-6">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-white">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
