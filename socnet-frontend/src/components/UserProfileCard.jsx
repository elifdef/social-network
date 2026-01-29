import { Link } from "react-router-dom";
import { useUserProfileLogic } from "../hooks/useUserProfileLogic";
import "../styles/old.css";

export default function UserProfileCard({ currentUser, isPreview = false }) {
    if (!currentUser) return null;

    const {
        sameUser,
        isBlockedByTarget,
        isBlockedByMe,
        loading,
        showMenu,
        setShowMenu,
        menuRef,
        displayAvatar,
        displayBio,
        displayBirth,
        displayCountry,
        handleMainBtnClick,
        handleBlockUser,
        getButtonContent,
        getBtnStyle
    } = useUserProfileLogic(currentUser, isPreview);

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
                            {!sameUser ? (
                                <>
                                    {!isBlockedByTarget && (
                                        <div className="vk-actions-container" ref={menuRef}>
                                            <button
                                                className="vk-btn"
                                                onClick={handleMainBtnClick}
                                                disabled={loading}
                                                style={getBtnStyle()}
                                            >
                                                {getButtonContent()}
                                            </button>
                                            {!isBlockedByMe && (
                                                <button className="vk-btn-more" onClick={() => setShowMenu(!showMenu)}>...</button>
                                            )}
                                            {showMenu && (
                                                <div className="vk-dropdown-menu">
                                                    <button className="vk-dropdown-item">Надіслати повідомлення</button>
                                                    <div style={{ borderTop: '1px solid #444', margin: '5px 0' }}></div>
                                                    <button className="vk-dropdown-item danger" onClick={handleBlockUser}>Заблокувати</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link to="/settings" className="vk-btn" style={{ textDecoration: 'none', lineHeight: '15px' }}>Редагувати</Link>
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
                        <span className="vk-nick" style={{ float: 'right', color: '#8c8c8c' }}>
                            {isPreview ? "Editing..." : (!isBlockedByTarget && "Online")}
                        </span>
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
                            <div className="vk-info-block" style={{ marginTop: 20 }}>
                                <h4 className="vk-section-title">Друзі (under constructor)</h4>
                                <div className="vk-info-row">
                                    <div className="vk-label">Підписники</div>
                                    <div className="vk-value">-1</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}