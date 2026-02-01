import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { APP_NAME } from "../config";
import { AuthContext } from "../context/AuthContext";

const LeftSidebar = () => {
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
                <h1>{APP_NAME}</h1>
            </div>

            <nav>
                <Link to="/" className={getLinkClass("/")}>
                    Головна
                </Link>

                {user && (
                    <>
                        <Link to={`/${user.username}`} className={getLinkClass(`/${user.username}`)}>
                            Моя сторінка
                        </Link>

                        <Link to="/messages" className={getLinkClass("/messages")}>
                            Повідомлення
                        </Link>

                        <Link to="/friends" className={getLinkClass("/friends")}>
                            <span>Друзі</span>
                        </Link>

                        <Link to="/settings" className={getLinkClass("/settings")}>
                            Налаштування
                        </Link>
                    </>
                )}
            </nav>
            <div className="sidebar-user-block">
                <Link to={`/${user.username}`} className="mini-user-info">
                    <img
                        src={user.avatar || "/defaultAvatar.jpg"}
                        alt="avatar"
                        className="mini-avatar"
                    />
                    <div className="mini-user-text">
                        <span className="mini-name">{user.first_name}</span>
                        <span className="mini-nick">@{user.username}</span>
                    </div>
                </Link>

                <button onClick={handleLogout} className="btn-logout">
                    Вийти
                </button>
            </div>
        </aside>
    );
};

export default LeftSidebar;