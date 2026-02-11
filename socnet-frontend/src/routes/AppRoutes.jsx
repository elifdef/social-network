import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import MainLayout from "../components/layout/MainLayout";
import SettingsLayout from '../pages/settings/SettingsLayout';

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

import ProfileSettings from '../pages/settings/ProfileSettings';
import SecuritySettings from '../pages/settings/SecuritySettings';

import { GuestGuard, AuthGuard, SetupGuard } from "./Guards";

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

                {/* маршрути для користувачів які ввійшли */}
                <Route element={<AuthGuard />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/friends" element={<FriendsPage />} />
                    <Route path="/messages" element={<div>messageTemplate</div>} />
                    <Route path="/email-verify/:id/:hash" element={<EmailVerifyPage />} />

                    <Route path="/settings" element={<SettingsLayout />}>
                        <Route index element={<Navigate to="profile" replace />} />
                        <Route path="profile" element={<ProfileSettings />} />
                        <Route path="security" element={<SecuritySettings />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}