import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";
import SettingsPage from '../pages/SettingsPage';
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SetupProfilePage from "../pages/SetupProfilePage";
import MainPage from "../pages/MainPage";
import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import FriendsPage from "../pages/FriendsPage";
import PostPage from "../pages/PostPage";
import EmailVerifyPage from "../pages/EmailVerifyPage";
import NotFoundPage from "../pages/NotFoundPage";
import AdminPage from '../pages/AdminPage';
import SupportPage from "../pages/SupportPage"
import RulesPage from "../pages/RulesPage";
import ModerationPage from "../pages/ModerationPage"
import { GuestGuard, AuthGuard, SetupGuard } from "./Guards";
import AdminUserInfo from "../components/admin/AdminUserInfo";
import { userRole } from "../config";
import NotificationsPage from "../pages/NotificationsPage";
import ActivityPage from "../pages/ActivityPage";
import MessagesPage from "../pages/MessagesPage";

export default function AppRoutes() {
    const { user } = useContext(AuthContext);

    return (
        <Routes>
            {!user && <Route path="/" element={<MainPage />} />}
            {/* тільки для гостей */}
            <Route element={<GuestGuard />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* якщо користувач не закінчив оформлення профілю вертаєм назад */}
            <Route element={<SetupGuard />}>
                <Route path="/setup-profile" element={<SetupProfilePage />} />
            </Route>

            <Route element={<MainLayout />}>
                {/* публічні сторінки */}
                <Route path="/:username" element={<ProfilePage />} />
                <Route path="/post/:id" element={<PostPage />} />

                {/* правила */}
                <Route path="/rules" element={<RulesPage />} />

                {/* маршрути для користувачів які ввійшли */}
                <Route element={<AuthGuard />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/friends" element={<FriendsPage />} />
                    <Route path="/messages" element={<MessagesPage/>} />
                    <Route path="/email-verify/:id/:hash" element={<EmailVerifyPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/activity/:tab?" element={<ActivityPage />} />

                    {user?.role >= userRole.Support && (
                        <Route path="/support" element={<SupportPage />} />
                    )}

                    {user?.role >= userRole.Moderator && (
                        <Route path="/moderation" element={<ModerationPage currentUser={user} />} />
                    )}

                    {user?.role >= userRole.Admin && (
                        <>
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/admin/users/:username" element={<AdminUserInfo />} />
                        </>
                    )}
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}