import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '../../hooks/useDateFormatter';
import Textarea from '../UI/Textarea';
import Button from '../UI/Button';
import MessageItemOld from './MessageItemOld';
import ChatScrollContainer from '../common/ChatScrollContainer';
import "./oldStyle.css";

export default function MessagesOld(props) {
    const {
        currentUser, chats, messages, activeChat, dmSlug, text, setText, files, editingMessage,
        handleSend, handleSelectChat, handleBackToInbox, handleEditClick,
        handleCancelEdit, handleDelete, handleFileChange, handleRemoveFile,
        isLoadingInitial, isLoadingMore, hasMore, onLoadMore, onOpenInfo, onDeleteChatClick,
        setReplyingTo, togglePin, replyingTo, handleCancelReplyEdit,
        isTyping, onTyping
    } = props;

    const { t } = useTranslation();
    const formatDate = useDateFormatter();
    const [isAttachOpen, setIsAttachOpen] = useState(false);
    const attachMenuRef = useRef(null);

    const pinnedMessage = messages.find(m => m.is_pinned);
    const myAvatar = currentUser?.avatar;
    const myName = currentUser?.first_name;

    const isOnline = (lastSeenDate) => {
        if (!lastSeenDate) return false;
        return (new Date() - new Date(lastSeenDate)) < 3 * 60 * 1000;
    };
    const targetOnline = isOnline(activeChat?.target_user?.last_seen_at);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) setIsAttachOpen(false);
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

    if (!activeChat) {
        return (
            <div className="socnet-messages-old-container">
                <div className="socnet-messages-old-tabs">
                    <span className="socnet-messages-old-tab active">{t('common.messages')}</span>
                </div>
                <div className="socnet-messages-old-dialog-list">
                    {chats.map(chat => (
                        <div key={chat.slug} className="socnet-messages-old-dialog-item" onClick={() => handleSelectChat(chat.slug)}>
                            <img src={chat.target_user?.avatar} alt="avatar" className="socnet-messages-old-avatar" />
                            <div className="socnet-messages-old-dialog-info">
                                <div className="socnet-messages-old-dialog-header">
                                    <span className="socnet-messages-old-link">{chat.target_user?.first_name} {chat.target_user?.last_name}</span>
                                    <span className="socnet-messages-old-date">{formatDate(chat.updated_at)}</span>
                                </div>
                                <div className="socnet-messages-old-dialog-snippet">
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
        );
    }

    return (
        <div className="socnet-messages-old-container in-chat">
            <div className="socnet-messages-old-chat-header-complex">
                <span className="socnet-messages-old-tab link" onClick={handleBackToInbox}>{t('common.back')}</span>
                <div className="socnet-im-header-center" onClick={onOpenInfo}>
                    <span className="socnet-im-chat-title">
                        {activeChat.target_user?.first_name} {activeChat.target_user?.last_name}
                        {targetOnline && !isTyping && <span className="socnet-im-online-square"></span>}
                    </span>
                    <span className="socnet-im-offline-text">
                        {isTyping ? (
                            <span className="socnet-typing-old">
                                <svg className="typing-pencil" viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                                {t('common.typing')}...
                            </span>
                        ) : (
                            !targetOnline && activeChat.target_user?.last_seen_at ? `${t('messages.was_online')} ${formatDate(activeChat.target_user.last_seen_at)}` : ""
                        )}
                    </span>
                </div>
                <div className="socnet-im-header-actions">
                    <button onClick={onDeleteChatClick} className="socnet-text-danger" title={t('messages.delete_chat')}>🗑</button>
                </div>
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
                className="socnet-messages-old-history-scroll"
                messagesLength={messages.length}
                isLoadingMore={isLoadingMore}
                isLoadingInitial={isLoadingInitial}
                hasMore={hasMore}
                onLoadMore={onLoadMore}
            >
                {messages.length === 0 && !isLoadingInitial ? (
                    <div className="socnet-empty-state socnet-empty-messages-list">{t('messages.no_messages_yet')}</div>
                ) : (
                    <div className="socnet-messages-old-history">
                        {messages.map(msg => (
                            <MessageItemOld
                                key={`old-${msg.id}`} msg={msg} myAvatar={myAvatar} myName={myName} targetUser={activeChat.target_user}
                                formatDate={formatDate} t={t} handleEditClick={handleEditClick} handleDelete={handleDelete}
                                setReplyingTo={setReplyingTo} togglePin={togglePin}
                            />
                        ))}
                    </div>
                )}
            </ChatScrollContainer>

            <div className="socnet-messages-old-composer-wrapper">
                {(editingMessage || replyingTo) && (
                    <div className="socnet-messages-old-editing">
                        {editingMessage ? t('messages.editing') : `${t('messages.reply')}: ${replyingTo.sender_name}`}
                        <div className="reply-preview-text">
                            {editingMessage ? '' : replyingTo.text}
                        </div>
                        <button onClick={handleCancelReplyEdit}>✕</button>
                    </div>
                )}
                {files.length > 0 && (
                    <div className="socnet-selected-files">
                        {files.map((f, idx) => (
                            <div key={idx} className="socnet-selected-file-item">{f.name} <button onClick={() => handleRemoveFile(idx)}>✕</button></div>
                        ))}
                    </div>
                )}

                <div className="socnet-messages-old-composer-inner">
                    <img src={myAvatar} alt="My Avatar" className="socnet-messages-old-avatar" />
                    <div className="socnet-messages-old-composer-center">
                        <Textarea className="socnet-messages-old-textarea" value={text} onChange={handleTextChange} onKeyDown={handleKeyDown} placeholder={t('messages.type_message')} />
                        <div className="socnet-messages-old-composer-actions">
                            <Button className="socnet-messages-old-send-btn" onClick={handleSend}>{editingMessage ? t('common.save') : t('messages.send')}</Button>
                            <div className="socnet-attach-wrapper" ref={attachMenuRef}>
                                <span className="socnet-messages-old-attach-label" onClick={() => setIsAttachOpen(!isAttachOpen)}>{t('messages.attach')}</span>
                                {isAttachOpen && (
                                    <div className="socnet-attach-dropdown">
                                        <label className="socnet-attach-dropdown-item"><span className="socnet-attach-icon">📸</span> {t('messages.attach_image')} <input type="file" accept="image/*" multiple className="socnet-hidden-input" onChange={(e) => { handleFileChange(e); setIsAttachOpen(false); }} /></label>
                                        <label className="socnet-attach-dropdown-item"><span className="socnet-attach-icon">🎥</span> {t('messages.attach_video')} <input type="file" accept="video/*" multiple className="socnet-hidden-input" onChange={(e) => { handleFileChange(e); setIsAttachOpen(false); }} /></label>
                                        <label className="socnet-attach-dropdown-item"><span className="socnet-attach-icon">📎</span> {t('messages.attach_file')} <input type="file" multiple className="socnet-hidden-input" onChange={(e) => { handleFileChange(e); setIsAttachOpen(false); }} /></label>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <img src={activeChat.target_user?.avatar} alt="Target Avatar" className="socnet-messages-old-avatar" />
                </div>

            </div>
        </div>
    );
}