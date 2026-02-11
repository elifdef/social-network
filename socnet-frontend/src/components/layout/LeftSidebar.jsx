import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { APP_NAME } from "../../config";
import { AuthContext } from "../../context/AuthContext";


const UserNav = ({ username, getLinkClass }) => {
    const { t } = useTranslation();

    return (
        <>
            <Link to={`/${username}`} className={getLinkClass(`/${username}`)}>
                {t('common.profile')}
            </Link>

            <Link to="/messages" className={getLinkClass("/messages")}>
                {t('sidebar.left.messages')}
            </Link>

            <Link to="/friends" className={getLinkClass("/friends")}>
                {t('common.friends')}
            </Link>

            <Link to="/settings" className={getLinkClass("/settings")}>
                {t('sidebar.left.settings')}
            </Link>
        </>
    );
};

const GuestNav = ({ getLinkClass }) => {
    const { t } = useTranslation();

    return (
        <>
            <div style={{ padding: '10px 0', color: '#71767b', fontSize: '13px' }}>
                {t('sidebar.guest.view_like_guest')}
            </div>
            <Link to="/login" className={getLinkClass("/login")}>
                {t('auth.signin')}
            </Link>
            <Link to="/register" className={getLinkClass("/register")}>
                {t('auth.signup')}
            </Link>
        </>
    );
};

const LeftSidebar = () => {
    const { t } = useTranslation();
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `nav-link ${isActive ? "active" : ""}`;
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1>{APP_NAME}</h1>
                </Link>
            </div>

            <nav>
                <Link to="/" className={getLinkClass("/")}>
                    {t('sidebar.left.home')}
                </Link>

                {user ? (
                    <UserNav username={user.username} getLinkClass={getLinkClass} />
                ) : (
                    <GuestNav getLinkClass={getLinkClass} />
                )}
            </nav>

            {user ? (
                <div className="sidebar-user-block">
                    <Link to={`/${user.username}`} className="mini-user-info">
                        <img
                            src={user?.avatar}
                            alt="avatar"
                            className="mini-avatar"
                        />
                        <div className="mini-user-text">
                            <span className="mini-name">{user.first_name}</span>
                            <span className="mini-nick">@{user.username}</span>
                        </div>
                    </Link>

                    <button onClick={handleLogout} className="btn-logout">
                        {t('auth.signout')}
                    </button>
                </div>
            ) : (
                <div className="sidebar-user-block">
                    <span style={{ fontSize: '12px', color: '#71767b' }}>
                        {t('sidebar.guest.get_full_access')}
                    </span>
                </div>
            )}
        </aside>
    );
};

export default LeftSidebar;