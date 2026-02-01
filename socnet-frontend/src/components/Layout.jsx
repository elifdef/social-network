import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar"
import Footer from "./Footer";
import EmailVerificationBanner from './EmailVerificationBanner'
import "../styles/App.css";

export default function Layout() {
    const { user } = useContext(AuthContext);

    return (
        <>
            <EmailVerificationBanner user={user} />
            <div className="app-container">
                <LeftSidebar />
                <main className="main-content">
                    <div style={{ minHeight: '80vh' }}>
                        <Outlet />
                    </div>
                </main>
                <RightSidebar />
            </div>
            <Footer />
        </>
    );
}