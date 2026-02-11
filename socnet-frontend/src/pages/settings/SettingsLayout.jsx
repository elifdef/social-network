import { useState, useEffect, useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import UserProfileCard from '../../components/profile/UserProfileCard';
import { useTranslation } from 'react-i18next';

const SettingsLayout = () => {
    const { t } = useTranslation();
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
        if (path.includes('/security')) 
            return t('common.security');
        return t('settings.profile_settings');
    };

    usePageTitle(getPageTitle());

    if (!user) 
        return <div className="vk-settings-page">{t('common.loading')}</div>;

    return (
        <div className="vk-settings-page">
            <div>
                <UserProfileCard currentUser={previewUser} isPreview={true} />
            </div>

            <div className="vk-settings-tabs">
                <NavLink to="profile" className={({ isActive }) => `vk-settings-tab ${isActive ? 'active' : ''}`}>
                    {t('common.profile')}
                </NavLink>
                <NavLink to="security" className={({ isActive }) => `vk-settings-tab ${isActive ? 'active' : ''}`}>
                    {t('common.security')}
                </NavLink>
            </div>
            <Outlet context={{ user, setUser, previewUser, setPreviewUser }} />
        </div>
    );
};

export default SettingsLayout;