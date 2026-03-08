import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '../../hooks/useDateFormatter';
import Textarea from '../UI/Textarea';
import Button from '../UI/Button';
import MessageItem from './MessageItem';
import ChatScrollContainer from '../common/ChatScrollContainer';

export default function Messages(props) {
    const {
        currentUser, chats, messages, activeChat, dmSlug, text, setText, files, editingMessage,
        handleSend, handleSelectChat, handleBackToInbox, handleEditClick,
        handleCancelEdit, handleDelete, handleFileChange, handleRemoveFile,
        isLoadingInitial, isLoadingMore, hasMore, onLoadMore,
        onOpenInfo, onDeleteChatClick, setReplyingTo, togglePin, replyingTo, handleCancelReplyEdit,
        onTyping, isTyping
    } = props;

    const { t } = useTranslation();
    const formatDate = useDateFormatter();

    const [isAttachOpen, setIsAttachOpen] = useState(false);
    const attachMenuRef = useRef(null);

    const pinnedMessage = messages.find(m => m.is_pinned);
    const targetOnline = (new Date() - new Date(activeChat?.target_user?.last_seen_at)) < 3 * 60 * 1000;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) setIsAttachOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleTextChange = (e) => {
        setText(e.target.value);
        if (onTyping) onTyping();
    };

    const handleScrollToMessage = (msgId) => {
        const el = document.getElementById(`message-${msgId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('socnet-highlight-msg');
            setTimeout(() => el.classList.remove('socnet-highlight-msg'), 2000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="socnet-messages-layout">
            <div className={`socnet-messages-sidebar ${activeChat ? 'hidden-on-mobile' : ''}`}>
                <div className="socnet-messages-sidebar-header">
                    <strong>{t('common.messages')}</strong>
                </div>
                <div className="socnet-messages-chat-list">
                    {chats.map(chat => (
                        <div key={chat.slug} className={`socnet-messages-chat-item ${dmSlug === chat.slug ? 'active' : ''}`} onClick={() => handleSelectChat(chat.slug)}>
                            <img src={chat.target_user?.avatar} alt="avatar" className="socnet-messages-avatar" />
                            <div className="socnet-messages-chat-info">
                                <div className="socnet-messages-chat-top">
                                    <span className="socnet-messages-chat-name">{chat.target_user?.first_name} {chat.target_user?.last_name}</span>
                                    <span className="socnet-messages-chat-time">{formatDate(chat.updated_at)}</span>
                                </div>
                                <div className="socnet-messages-chat-preview">
                                    {chat.last_message_sender_id === currentUser?.id ? (
                                        <span className="socnet-msg-preview-you">{t('common.you')}: </span>
                                    ) : (
                                        chat.last_message_sender_id ? <span className="socnet-msg-preview-them">{chat.target_user?.first_name}: </span> : ''
                                    )}
                                    {chat.last_message}
                                </div>
                            </div>
                        </div>
                    ))}
                    {chats.length === 0 && <div className="socnet-empty-state">{t('messages.empty_inbox')}</div>}
                </div>
            </div>

            <div className={`socnet-messages-chat-area ${!activeChat ? 'hidden-on-mobile' : ''}`}>
                {!activeChat ? (
                    <div className="socnet-messages-empty-state">{t('messages.select_chat')}</div>
                ) : (
                    <>
                        <div className="socnet-messages-chat-header">
                            <button className="socnet-messages-back-btn" onClick={handleBackToInbox}>←</button>

                            <div className="socnet-chat-header-user-link" onClick={onOpenInfo}>
                                <img src={activeChat.target_user?.avatar} alt="avatar" className="socnet-messages-avatar-small" />
                                <div className="socnet-messages-header-info">
                                    <div className="socnet-messages-header-name">{activeChat.target_user?.first_name} {activeChat.target_user?.last_name}</div>
                                    <div className="socnet-messages-header-status">
                                        {isTyping ? (
                                            <span className="socnet-typing-text-modern">{t('common.typing')}<span className="typing-dots"></span></span>
                                        ) : targetOnline ? (
                                            <span className="socnet-status-online">{t('messages.online')}</span>
                                        ) : (
                                            <span className="socnet-status-offline">{activeChat.target_user?.last_seen_at ? formatDate(activeChat.target_user.last_seen_at) : ''}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button onClick={onDeleteChatClick} className="socnet-chat-header-delete-btn" title={t('messages.delete_chat')}>🗑</button>
                        </div>

                        {pinnedMessage && (
                            <div className="socnet-pinned-message-bar" onClick={() => handleScrollToMessage(pinnedMessage.id)}>
                                <div className="pinned-icon">📌</div>
                                <div className="pinned-content">
                                    <div className="pinned-title">{t('messages.pinned_message')}</div>
                                    <div className="pinned-text">{pinnedMessage.text || t('messages.media')}</div>
                                </div>
                                <button className="pinned-close" onClick={(e) => { e.stopPropagation(); togglePin(pinnedMessage.id); }}>✖</button>
                            </div>
                        )}

                        <ChatScrollContainer
                            className="socnet-messages-history-scroll"
                            messagesLength={messages.length}
                            isLoadingMore={isLoadingMore}
                            isLoadingInitial={isLoadingInitial}
                            hasMore={hasMore}
                            onLoadMore={onLoadMore}
                        >
                            {messages.length === 0 && !isLoadingInitial ? (
                                <div className="socnet-empty-state socnet-empty-messages-list">{t('messages.no_messages_yet')}</div>
                            ) : (
                                <div className="socnet-messages-messages-history">
                                    {messages.map(msg => (
                                        <MessageItem key={`mod-${msg.id}`} msg={msg} formatDate={formatDate} t={t} handleEditClick={handleEditClick} handleDelete={handleDelete} setReplyingTo={setReplyingTo} togglePin={togglePin} />
                                    ))}
                                </div>
                            )}
                        </ChatScrollContainer>

                        <div className="socnet-messages-chat-input-wrapper">
                            {files.length > 0 && (
                                <div className="socnet-selected-files">
                                    {files.map((f, idx) => (
                                        <div key={idx} className="socnet-selected-file-item">
                                            <span>{f.name}</span><button onClick={() => handleRemoveFile(idx)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(editingMessage || replyingTo) && (
                                <div className="socnet-editing-banner">
                                    <span>{editingMessage ? t('messages.editing') : `${t('messages.reply')}: ${replyingTo.sender_name}`}</span>
                                    <div className="reply-preview-text">{editingMessage ? '' : replyingTo.text}</div>
                                    <button onClick={handleCancelReplyEdit}>✕</button>
                                </div>
                            )}

                            <div className="socnet-messages-chat-input">
                                <div className="socnet-attach-wrapper" ref={attachMenuRef}>
                                    <button className="socnet-attach-btn-clear" onClick={() => setIsAttachOpen(!isAttachOpen)}>📎</button>
                                    {isAttachOpen && (
                                        <div className="socnet-attach-dropdown modern">
                                            <label className="socnet-attach-dropdown-item"><span className="socnet-attach-icon"></span> {t('messages.attach_image')} <input type="file" accept="image/*" multiple className="socnet-hidden-input" onChange={(e) => { handleFileChange(e); setIsAttachOpen(false); }} /></label>
                                            <label className="socnet-attach-dropdown-item"><span className="socnet-attach-icon"></span> {t('messages.attach_video')} <input type="file" accept="video/*" multiple className="socnet-hidden-input" onChange={(e) => { handleFileChange(e); setIsAttachOpen(false); }} /></label>
                                            <label className="socnet-attach-dropdown-item"><span className="socnet-attach-icon"></span> {t('messages.attach_file')} <input type="file" multiple className="socnet-hidden-input" onChange={(e) => { handleFileChange(e); setIsAttachOpen(false); }} /></label>
                                        </div>
                                    )}
                                </div>
                                <Textarea className="socnet-form-textarea" placeholder={t('messages.type_message')} value={text} onChange={handleTextChange} onKeyDown={handleKeyDown} />
                                <Button className="socnet-messages-send-btn" onClick={handleSend}>{editingMessage ? t('common.save') : t('messages.send')}</Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}