import { useState, useEffect, useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import UserProfileCard from '../../components/UserProfileCard';
import '../../styles/Settings.css';

const SettingsLayout = () => {
    const { user, setUser } = useContext(AuthContext);
    const [previewUser, setPreviewUser] = useState(user);
    const location = useLocation();

    useEffect(() => {
        if (user) {
            setPreviewUser(user);
        }
    }, [user]);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/security')) return 'Безпека';
        return 'Налаштування профілю';
    };

    usePageTitle(getPageTitle());

    if (!user) return <div className="settings-container">Завантаження...</div>;

    return (
        <div className="settings-container">
            <div>
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
            <Outlet context={{ user, setUser, previewUser, setPreviewUser }} />
        </div>
    );
};

export default SettingsLayout;