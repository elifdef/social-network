import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDateFormatter } from '../../hooks/useDateFormatter';
import { AuthContext } from '../../context/AuthContext';
export default function ChatInfoModal({ isOpen, onClose, chat, messages }) {
    const { t } = useTranslation();
    const formatDate = useDateFormatter();
    const { user: currentUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('media');

    if (!isOpen || !chat) return null;

    // визначаємо, хто почав переписку
    let initiatorName = '';
    if (chat.initiator_id === currentUser?.id) {
        initiatorName = t('common.you');
    } else {
        initiatorName = chat.target_user?.first_name;
    }

    const allFiles = messages.flatMap(msg => msg.files || []);
    const mediaFiles = allFiles.filter(f => f.name.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm)$/i));
    const documentFiles = allFiles.filter(f => !f.name.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm)$/i));

    return (
        <div className="socnet-modal-overlay" onClick={onClose}>
            <div className="socnet-modal-dialog socnet-messages-old-info-modal" onClick={e => e.stopPropagation()}>
                <div className="socnet-messages-old-chat-header">
                    {t('messages.chat_info')}
                    <button className="socnet-old-modal-close" onClick={onClose}>✕</button>
                </div>
                
                <div className="socnet-old-info-profile">
                    <Link to={`/${chat.target_user?.username}`}>
                        <img src={chat.target_user?.avatar} alt="avatar" />
                    </Link>
                    <div className="socnet-old-info-details">
                        <Link to={`/${chat.target_user?.username}`} className="socnet-messages-old-link socnet-messages-old-author" style={{fontSize: '14px'}}>
                            {chat.target_user?.first_name} {chat.target_user?.last_name}
                        </Link>
                        <div className="socnet-messages-old-date" style={{marginTop: '5px'}}>
                            {t('messages.chat_started')}: {initiatorName} ({formatDate(chat.created_at)})
                        </div>
                    </div>
                </div>

                <div className="socnet-messages-old-tabs" style={{padding: '10px 15px', margin: 0, borderTop: 'none'}}>
                    <span className={`socnet-messages-old-tab ${activeTab === 'media' ? 'active' : 'link'}`} onClick={() => setActiveTab('media')}>
                        {t('messages.tab_media')} <span className="socnet-tab-count">{mediaFiles.length}</span>
                    </span>
                    <span className={`socnet-messages-old-tab ${activeTab === 'files' ? 'active' : 'link'}`} onClick={() => setActiveTab('files')}>
                        {t('messages.tab_files')} <span className="socnet-tab-count">{documentFiles.length}</span>
                    </span>
                </div>

                <div className="socnet-old-info-content">
                    {activeTab === 'media' && (
                        <div className="socnet-old-info-media-grid">
                            {mediaFiles.length > 0 ? mediaFiles.map((file, idx) => (
                                <img key={idx} src={file.url} alt="attachment" className="socnet-msg-image-attachment" />
                            )) : <div className="socnet-empty-state">{t('messages.empty_inbox')}</div>}
                        </div>
                    )}
                    
                    {activeTab === 'files' && (
                        <div className="socnet-old-info-files-list">
                            {documentFiles.length > 0 ? documentFiles.map((file, idx) => (
                                <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="socnet-messages-old-link">
                                    📎 {file.name}
                                </a>
                            )) : <div className="socnet-empty-state">{t('messages.empty_inbox')}</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}