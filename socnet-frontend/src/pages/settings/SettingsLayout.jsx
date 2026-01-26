import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import toast from "react-hot-toast";
import api from '../../api/axios';
import '../../styles/Settings.css';
import '../../styles/old.css';
import UserProfileCard from '../../components/UserProfileCard';

const SettingsLayout = () => {
    const [user, setUser] = useState(null);
    const [previewUser, setPreviewUser] = useState(null);

    const fetchUser = useCallback(() => {
        api.get('/me')
            .then(res => {
                setUser(res.data);
                setPreviewUser(res.data);
            })
            .catch(err => toast.error("Помилка завантаження"));
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (!user) return <div className="settings-container">Завантаження...</div>;

    return (
        <div className="settings-container">
            <div style={{ marginBottom: '30px' }}>
                <UserProfileCard currentUser={previewUser} isPreview={true} />
            </div>
            <div className="settings-tabs">
                <NavLink to="profile" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
                    Профіль
                </NavLink>
                <NavLink to="security" className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}>
                    Безпека
                </NavLink>
            </div>
            <Outlet context={{ user, previewUser, setPreviewUser, fetchUser }} />
        </div>
    );
};

export default SettingsLayout;