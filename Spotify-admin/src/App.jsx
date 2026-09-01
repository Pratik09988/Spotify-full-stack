import React, { useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AddSong from "./pages/AddSong";
import AddAlbum from "./pages/AddAlbum";
import AddArtist from "./pages/AddArtist";
import ListAlbum from "./pages/ListAlbum";
import ListSong from "./pages/ListSong";
import ListArtist from "./pages/ListArtist";
import ListUser from "./pages/ListUser";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/AdminLogin";

export const url = "http://localhost:4000";

const AdminLayout = () => {
    const location = useLocation();
    const displayRef = useRef(null);

    useEffect(() => {
        if (displayRef.current) {
            displayRef.current.scrollTo({
                top: 0,
                behavior: "auto"
            });
        }
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="flex h-screen overflow-hidden bg-[#F5F1E8]">
            <Sidebar />
            <div ref={displayRef}id="admin-content"className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden bg-[#F5F1E8]">
                <Navbar />
                <main className="px-5 py-6 sm:px-8 lg:px-10">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />}/>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/add-song" element={<AddSong />} />
                        <Route path="/add-album" element={<AddAlbum />} />
                        <Route path="/add-artist" element={<AddArtist />} />
                        <Route path="/list-song" element={<ListSong />} />
                        <Route path="/list-album" element={<ListAlbum />} />
                        <Route path="/list-artist" element={<ListArtist />} />
                        <Route path="/list-user" element={<ListUser />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <>
            <ToastContainer />
            <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/*" element={<ProtectedRoute>
                    <AdminLayout />
                </ProtectedRoute>} />
            </Routes>
        </>
    );
};

export default App;