import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserProfileLogic } from "../hooks/useUserProfileLogic";
import "../styles/old.css";

export default function UserProfileCard({ currentUser, isPreview = false }) {
    if (!currentUser) return null;

    const {
        status,
        loading,
        sameUser,
        isBlockedByMe,
        isBlockedByTarget,
        displayAvatar,
        displayBio,
        displayBirth,
        displayCountry,
        handleFriendshipAction,
        handleBlockAction
    } = useUserProfileLogic(currentUser, isPreview);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getStatusLabel = () => {
        if (loading) return "...";
        if (isBlockedByMe) return "Ви заблокували"; // або "Заблоковано"
        switch (status) {
            case 'friends': return "У вас в друзях ✓";
            case 'pending_sent': return "Заявка надіслана";
            case 'pending_received': return "Заявка отримана";
            case 'none': default: return "Не у вас у друзях";
        }
    };

    const getFriendActionLabel = () => {
        switch (status) {
            case 'friends': return "Видалити з друзів";
            case 'pending_sent': return "Скасувати заявку";
            case 'pending_received': return "Прийняти заявку";
            case 'none': default: return "Додати у друзі";
        }
    };

    return (
        <div className="vk-card-wrapper">
            <div className="vk-container">
                <div className="vk-left-col">
                    <div className="vk-photo-box">
                        <img
                            src={displayAvatar}
                            alt={currentUser.username}
                            className="vk-avatar"
                            style={!isPreview && isBlockedByTarget ? { opacity: 0.6, filter: 'grayscale(100%)' } : {}}
                        />
                    </div>

                    {!isPreview && (
                        <div className="vk-actions">
                            {sameUser ? (
                                <Link to="/settings" className="vk-btn">Редагувати</Link>
                            ) : (
                                <>
                                    {!isBlockedByTarget && (
                                        <div className="vk-dropdown-wrapper" ref={menuRef}>
                                            <button
                                                className="vk-btn vk-btn-dropdown-trigger"
                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                disabled={loading}
                                            >
                                                {getStatusLabel()}
                                            </button>

                                            {isMenuOpen && (
                                                <div className="vk-menu-list">
                                                    {!isBlockedByMe && (
                                                        <>
                                                            <button
                                                                className="vk-menu-item"
                                                                onClick={() => {
                                                                    handleFriendshipAction();
                                                                    setIsMenuOpen(false);
                                                                }}
                                                            >
                                                                {getFriendActionLabel()}
                                                            </button>
                                                            <button
                                                                className={`vk-menu-item ${!isBlockedByMe ? 'danger' : ''}`}
                                                                onClick={() => {
                                                                    handleBlockAction();
                                                                    setIsMenuOpen(false);
                                                                }}
                                                            >
                                                                {isBlockedByMe ? "Розблокувати" : "Заблокувати"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="vk-right-col">
                    <div className="vk-name-row">
                        <h2 className="vk-name">
                            {currentUser.first_name} {currentUser.last_name}
                            <span className="vk-nick"> @{currentUser.username}</span>
                        </h2>
                        <span className="vk-nick" style={{ float: 'right', color: '#8c8c8c' }}>{currentUser.is_online ? "Online" : "Offline"}</span>
                    </div>

                    <div className="vk-status-box">
                        {displayBio}
                    </div>

                    {(isPreview || !isBlockedByTarget) && (
                        <>
                            <div className="vk-info-block">
                                <h4 className="vk-section-title">Інформація</h4>
                                <div className="vk-info-row">
                                    <div className="vk-label">День народження:</div>
                                    <div className="vk-value">{displayBirth}</div>
                                </div>
                                <div className="vk-info-row">
                                    <div className="vk-label">Країна проживання</div>
                                    <div className="vk-value">{displayCountry}</div>
                                </div>
                                <div className="vk-info-row">
                                    <div className="vk-label">Зареєстровано:</div>
                                    <div className="vk-value">{currentUser.created_at}</div>
                                </div>
                            </div>
                            {!isPreview && (
                                <div className="vk-info-block">
                                    <h4 className="vk-section-title">Друзі</h4>
                                    <div className="vk-info-row">
                                        <div className="vk-label">Друзі</div>
                                        <div className="vk-value">
                                            {currentUser.friends_count !== undefined ? currentUser.friends_count : 0}
                                        </div>
                                    </div>
                                    <div className="vk-info-row">
                                        <div className="vk-label">Підписники</div>
                                        <div className="vk-value">
                                            {currentUser.followers_count !== undefined ? currentUser.followers_count : 0}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}