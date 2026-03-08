export default function MessageItem({ msg, formatDate, t, handleEditClick, handleDelete, setReplyingTo, togglePin }) {
    return (
        <div id={`message-${msg.id}`} className={`socnet-messages-msg-wrapper ${msg.isMine ? 'mine' : 'theirs'}`}>
            <div className="socnet-messages-msg-bubble">

                {msg.reply_to && (
                    <div className="socnet-message-reply-quote">
                        <div className="reply-author">{msg.reply_to.sender_name}</div>
                        <div className="reply-text">{msg.reply_to.text}</div>
                    </div>
                )}

                <div className="socnet-messages-msg-text">{msg.text}</div>

                {msg.files?.length > 0 && (
                    <div className="socnet-msg-files">
                        {msg.files.map((file, idx) => (
                            <img key={idx} src={file.url} alt="attachment" className="socnet-msg-image-attachment" />
                        ))}
                    </div>
                )}

                <div className="socnet-messages-msg-time">
                    {formatDate(msg.created_at)} {msg.is_edited && <span>({t('common.edited')})</span>}
                </div>

                <div className="socnet-msg-actions">
                    <button onClick={() => setReplyingTo(msg)}>{t('messages.reply')}</button>
                    <button onClick={() => togglePin(msg.id)}>{msg.is_pinned ? t('messages.unpin') : t('messages.pin')}</button>
                    {msg.isMine && (
                        <>
                            <button onClick={() => handleEditClick(msg)}>{t('common.edit')}</button>
                            <button onClick={() => handleDelete(msg.id)} className="socnet-text-danger">{t('common.delete')}</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}