import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useInbox } from "../../hooks/useInbox";

export default function ProfileActions({
    sameUser, userId, loading, status, isBlockedByMe, isBlockedByTarget,
    onFriendAction, onBlockAction, onReportAction
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { initChat } = useInbox();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
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

    if (sameUser)
        return (
            <div className="socnet-actions">
                <Link to="/settings" className="socnet-btn">{t('common.edit')}</Link>
            </div>
        );

    if (isBlockedByTarget)
        return null;

    const getStatusLabel = () => {
        if (loading) return "...";
        if (isBlockedByMe) return t('profile.menu.you_have_blocked');

        switch (status) {
            case 'friends': return `${t('common.your_friends')} ✓`;
            case 'pending_sent': return t('friends.request_sent');
            case 'pending_received': return t('profile.menu.request_received');
            default: return t('profile.menu.not_your_friends');
        }
    };

    const getFriendActionLabel = () => {
        switch (status) {
            case 'friends': return t('friends.remove_friends');
            case 'pending_sent': return t('profile.menu.cancel_request');
            case 'pending_received': return t('friends.accept_request');
            default: return t('profile.menu.add_friends');
        }
    };

    const handleSendMessage = async () => {
        setIsChatLoading(true);
        try {
            const slug = await initChat(userId);
            if (slug) {
                navigate(`/messages?dm=${slug}`);
            }
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="socnet-actions">
            {!isBlockedByMe && (
                <button 
                    className="socnet-btn" 
                    onClick={handleSendMessage}
                    disabled={isChatLoading || loading}
                >
                    {isChatLoading ? '...' : t('messages.send_message')}
                </button>
            )}

            <div className="socnet-dropdown-wrapper" ref={menuRef}>
                <button
                    className="socnet-btn socnet-btn-dropdown-trigger"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    disabled={loading}
                >
                    {getStatusLabel()}
                </button>

                {isMenuOpen && (
                    <div className="socnet-menu-list">
                        {!isBlockedByMe && (
                            <button className="socnet-menu-item" onClick={() => { onFriendAction(); setIsMenuOpen(false); }}>
                                {getFriendActionLabel()}
                            </button>
                        )}
                        
                        <button
                            className="socnet-menu-item"
                            onClick={() => { onReportAction(); setIsMenuOpen(false); }}
                        >
                            {t('reports.title')}
                        </button>

                        <button
                            className={`socnet-menu-item ${!isBlockedByMe ? 'danger' : ''}`}
                            onClick={() => { onBlockAction(); setIsMenuOpen(false); }}
                        >
                            {isBlockedByMe
                                ? t('common.to_unblock')
                                : t('common.to_block')
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}