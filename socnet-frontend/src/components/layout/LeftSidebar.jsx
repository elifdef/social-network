import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { APP_NAME, userRole } from "../../config";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";

const LeftSidebar = ({ isOpen }) => {
    const { t } = useTranslation();
    const { logout, user } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const location = useLocation();
    const navigate = useNavigate();

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `socnet-nav-item ${isActive ? "active" : ""}`;
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const displayCount = unreadCount > 99 ? '99+' : unreadCount;

    return (
        <aside className={`socnet-sidebar-left ${isOpen ? 'mobile-open' : ''}`}>
            <Link to="/" className="socnet-logo">
                {APP_NAME}
            </Link>

            <nav className="socnet-nav-list">
                {user ? (
                    <>
                        <Link to="/" className={getLinkClass("/")}>
                            {t('sidebar.left.home')}
                        </Link>
                        <Link to={`/${user.username}`} className={getLinkClass(`/${user.username}`)}>
                            {t('common.profile')}
                        </Link>
                        <Link to="/messages" className={getLinkClass("/messages")}>
                            {t('common.messages')}
                        </Link>
                        <Link to="/friends" className={getLinkClass("/friends")}>
                            {t('common.friends')}
                        </Link>
                        <Link to="/notifications" className={getLinkClass("/notifications")}>
                            {t('common.notifications')}
                            {unreadCount > 0 && (<span className="socnet-badge">{displayCount}</span>)}
                        </Link>
                        <Link to="/activity" className={getLinkClass("/activity")}>
                            {t('common.activity')}
                        </Link>
                        <Link to="/settings" className={getLinkClass("/settings")}>
                            {t('sidebar.left.settings')}
                        </Link>

                        {user.role === userRole.Support && (
                            <>
                                <hr />
                                <Link to="/support" className={`${getLinkClass("/support")} nav-link-support`}>
                                    {t('common.support_panel')}
                                </Link>
                            </>
                        )}

                        {user.role === userRole.Moderator && (
                            <>
                                <hr />
                                <Link to="/moderation" className={`${getLinkClass("/moderation")} nav-link-moderator`}>
                                    {t('common.moderator_panel')}
                                </Link>
                            </>
                        )}

                        {user.role === userRole.Admin && (
                            <>
                                <hr />
                                <Link to="/control-panel" className={`${getLinkClass("/admin")} nav-link-admin`}>
                                    {t('common.admin_panel')}
                                </Link>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <Link to="/login" className={getLinkClass("/login")}>
                            {t('auth.signin')}
                        </Link>
                        <Link to="/register" className={getLinkClass("/register")}>
                            {t('auth.signup')}
                        </Link>
                    </>
                )}
            </nav>

            {user && (
                <div className="socnet-sidebar-profile">
                    <Link to={`/${user.username}`} className="socnet-mini-profile-link">
                        <img
                            src={user?.avatar}
                            alt="avatar"
                            className="socnet-mini-avatar"
                        />
                        <div className="socnet-mini-name">
                            {user.first_name || user.username}
                        </div>
                    </Link>
                    <button onClick={handleLogout} className="socnet-logout-btn">
                        {t('auth.signout')}
                    </button>
                </div>
            )}

            {!user && (
                <div className="socnet-sidebar-profile socnet-sidebar-guest-notice">
                    {t('sidebar.guest.view_like_guest')}
                </div>
            )}
        </aside>
    );
};

export default LeftSidebar;