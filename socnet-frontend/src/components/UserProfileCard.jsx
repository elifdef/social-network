import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/old.css";

export default function UserProfileCard({ currentUser, isPreview = false }) {
    if (!currentUser) return null;
    const { user } = useContext(AuthContext);
    const sameUser = user && currentUser.username === user.username;
    const defaultAvatar = "/defaultAvatar.jpg"; // bill gates mugshot

    return (
        <div className="vk-card-wrapper">
            <div className="vk-container">
                <div className="vk-left-col">
                    <div className="vk-photo-box">
                        <img
                            src={currentUser.avatar || defaultAvatar}
                            alt={currentUser.username}
                            className="vk-avatar"
                        />
                    </div>

                    {!isPreview && (
                        <div className="vk-actions">
                            {/* Якщо це ЧУЖИЙ профіль */}
                            {!sameUser ? (
                                <>
                                    <button className="vk-btn">Надіслати повідомлення</button>
                                    <button className="vk-btn">Додати у друзі</button>
                                </>
                            ) : (
                                /* Якщо це МІЙ профіль */
                                <Link to="/settings" className="vk-btn" style={{ textDecoration: 'none', lineHeight: '15px' }}>Редагувати сторінку</Link>
                            )}
                        </div>
                    )}
                </div>
                <div className="vk-right-col">
                    <div className="vk-name-row">
                        <h2 className="vk-name">
                            {currentUser.first_name} {currentUser.last_name}
                            <span className="vk-nick"> {currentUser.username}</span>
                        </h2>
                        <span className="vk-nick" style={{ float: 'right', color: '#8c8c8c' }}>Online</span>
                    </div>

                    <div className="vk-status-box">{currentUser.bio || "тут міг бути ваш статус..."}</div>

                    <div className="vk-info-block">
                        <h4 className="vk-section-title">Інформація</h4>

                        <div className="vk-info-row">
                            <div className="vk-label">День народження:</div>
                            <div className="vk-value">{currentUser.birth_date}</div>
                        </div>

                        <div className="vk-info-row">
                            <div className="vk-label">Рідне місто:</div>
                            <div className="vk-value">Кривий Ріг</div>
                        </div>

                        <div className="vk-info-row">
                            <div className="vk-label">Зареєстровано:</div>
                            <div className="vk-value">{currentUser.created_at}</div>
                        </div>
                    </div>

                    <div className="vk-info-block" style={{ marginTop: 20 }}>
                        <h4 className="vk-section-title">Контакти</h4>
                        <div className="vk-info-row">
                            <div className="vk-label">E-mail:</div>
                            <div className="vk-value">{currentUser.email}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}