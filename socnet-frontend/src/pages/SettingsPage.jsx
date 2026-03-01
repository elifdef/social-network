import { useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTranslation } from 'react-i18next';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';

const SettingsPage = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('act') || 'profile';

    const getPageTitle = () => {
        if (activeTab === 'security') return t('common.security');
        return t('settings.profile_settings');
    };
    usePageTitle(getPageTitle());

    if (!user) 
        return <div className="socnet-settings-page">{t('common.loading')}</div>;

    const getTabClass = (tabName) => {
        return `socnet-tab ${activeTab === tabName ? 'active' : ''}`;
    };

    return (
        <div className="socnet-settings-page">
            <div className="socnet-tabs">
                <Link to="/settings?act=profile" className={getTabClass('profile')}>
                    {t('common.profile')}
                </Link>
                <Link to="/settings?act=security" className={getTabClass('security')}>
                    {t('common.security')}
                </Link>
            </div>

            <div className="settings-content">
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'security' && <SecuritySettings />}
            </div>
        </div>
    );
};

export default SettingsPage;