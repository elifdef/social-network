import { Link } from "react-router-dom";

export default function MessageItemOld({ msg, myAvatar, myName, targetUser, formatDate, t, handleEditClick, handleDelete, setReplyingTo, togglePin }) {
    return (
        <div id={`message-${msg.id}`} className="socnet-messages-old-message-row">
            <div className="socnet-messages-old-msg-left">
                <img src={msg.isMine ? myAvatar : targetUser?.avatar} alt="avatar" className="socnet-messages-old-avatar" />
            </div>
            <div className="socnet-messages-old-msg-right">
                <div className="socnet-im-msg-layout">
                    <div className="socnet-im-msg-main">
                        <Link
                            to={`/${msg.isMine ? myName : targetUser.username}`}
                            className="socnet-messages-old-link socnet-messages-old-author"
                        >
                            {msg.isMine ? myName : targetUser?.first_name}
                        </Link>

                        {msg.reply_to && (
                            <div className="socnet-message-reply-quote">
                                <div className="reply-author">{msg.reply_to.sender_name}</div>
                                <div className="reply-text">{msg.reply_to.text}</div>
                            </div>
                        )}

                        <div className="socnet-messages-old-msg-text">{msg.text}</div>
                        {msg.files?.length > 0 && (
                            <div className="socnet-msg-files">
                                {msg.files.map((file, idx) => (
                                    <img key={idx} src={file.url} alt="attachment" className="socnet-msg-image-attachment" />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="socnet-im-msg-side">
                        <span className="socnet-messages-old-date">{formatDate(msg.created_at)}</span>
                        <div className="socnet-im-msg-controls">
                            {msg.is_edited && <span className="socnet-edited-mark">({t('common.edited')})</span>}

                            <div className="socnet-messages-old-actions-inline">
                                <span className="socnet-action-link" onClick={() => setReplyingTo(msg)}>{t('messages.reply')}</span>
                                <span className="socnet-action-link" onClick={() => togglePin(msg.id)}>
                                    {msg.is_pinned ? t('messages.unpin') : t('messages.pin')}
                                </span>
                                {msg.isMine && (
                                    <>
                                        <span className="socnet-action-link" onClick={() => handleEditClick(msg)}>{t('common.edit')}</span>
                                        <span className="socnet-action-link danger" onClick={() => handleDelete(msg.id)}>{t('common.delete')}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}