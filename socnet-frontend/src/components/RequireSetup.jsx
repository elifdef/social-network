import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RequireSetup() {
    // це створено щоб запобігти використанню сайта якщо користувач не закінчив оформлення профілю
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="loading-screen">Завантаження...</div>;
    if (user && !user.is_setup_complete) return <Navigate to="/setup-profile" replace />;
    return <Outlet />;
}