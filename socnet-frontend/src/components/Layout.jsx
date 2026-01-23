import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { APP_NAME } from "../config";
import api from "../api/axios";
import Footer from "./Footer";
import "../styles/App.css";

export default function Layout() {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [requestsCount, setRequestsCount] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `nav-link ${isActive ? "active" : ""}`;
    };

    // обновлення лічильника заявок при переході між сторінками
    useEffect(() => {
        if (user) {
            api.get('/friends/count')
                .then(res => setRequestsCount(res.data.requests_count))
                .catch(err => console.error("Помилка лічильника", err));
        }
    }, [user, location.pathname]);

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div style={{ marginBottom: '30px', paddingLeft: '15px' }}>
                    <h1 className="cyber-name" style={{ fontSize: '24px' }}>{APP_NAME}</h1>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

                            <Link to="/friends" className={getLinkClass("/friends")} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Друзі</span>
                                {requestsCount > 0 && (
                                    <span style={{
                                        background: '#ff3333',
                                        color: 'white',
                                        fontSize: '11px',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        {requestsCount}
                                    </span>
                                )}
                            </Link>

                            <Link to="/settings" className={getLinkClass("/settings")}>
                                Налаштування
                            </Link>
                        </>
                    )}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {user ? (
                        <div className="sidebar-user-block">
                            <Link to={`/${user.username}`} className="mini-user-info">
                                <img
                                    src={user.avatar || "/defaultAvatar.jpg"}
                                    alt="avatar"
                                    className="mini-avatar-circle"
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
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                                Ви не авторизовані
                            </p>
                            <Link to="/login" className="btn" style={{ textAlign: 'center', textDecoration: 'none' }}>
                                Увійти
                            </Link>
                            <Link to="/register" style={{ textAlign: 'center', color: '#aaa', fontSize: '12px' }}>
                                Реєстрація
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            <main className="main-content">
                <div style={{ minHeight: '80vh' }}>
                    <Outlet />
                </div>
                <Footer />
            </main>
        </div>
    );
}