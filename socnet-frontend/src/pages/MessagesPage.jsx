import { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useInbox } from '../hooks/useInbox';
import { useMessages } from '../hooks/useMessages';
import { NotificationContext } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import Messages from '../components/messages/Messages';
import MessagesOld from '../components/messages/MessagesOld';
import ActionModal from '../components/common/ActionModal';
import { chatApi } from '../api/messages.api';
import ChatInfoModal from '../components/messages/ChatInfoModal';

export default function MessagesPage() {
    const { t } = useTranslation();
    usePageTitle(t('common.messages'));

    const [searchParams, setSearchParams] = useSearchParams();
    const dmSlug = searchParams.get('dm');

    const { user: currentUser } = useContext(AuthContext);
    const { chats, fetchChats } = useInbox();

    const { setUnreadMessagesCount, incomingMessage, echoInstance } = useContext(NotificationContext);

    const [text, setText] = useState('');
    const [files, setFiles] = useState([]);
    const [editingMessage, setEditingMessage] = useState(null);
    const [messageToDelete, setMessageToDelete] = useState(null);

    const {
        messages, fetchMessages, loadMoreMessages, sendMessage, updateMessage, deleteMessage, togglePin,
        isLoadingInitial, isLoadingMore, hasMore, targetIsTyping, emitTyping
    } = useMessages(dmSlug, echoInstance);

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);
    const [deleteForBoth, setDeleteForBoth] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        setUnreadMessagesCount(0);
        fetchChats();
    }, [setUnreadMessagesCount, fetchChats]);

    useEffect(() => {
        if (dmSlug) fetchMessages();
        else { setText(''); setFiles([]); setEditingMessage(null); }
    }, [dmSlug, fetchMessages]);

    useEffect(() => {
        if (incomingMessage) {
            fetchChats();

            // якщо повідомлення для поточного відкритого чату
            if (incomingMessage.chat_slug === dmSlug) {
                fetchMessages({ silent: true });
            }
        }
    }, [incomingMessage, dmSlug, fetchMessages, fetchChats]);

    const handleSelectChat = (slug) => setSearchParams({ dm: slug });
    const handleBackToInbox = () => setSearchParams({});

    const handleSend = async () => {
        if (!text.trim() && files.length === 0) return;
        try {
            if (editingMessage) {
                await updateMessage(editingMessage.id, text, files, []);
                setEditingMessage(null);
            } else {
                await sendMessage(text, files, null, replyingTo ? replyingTo.id : null);
            }
            setText(''); setFiles([]); setReplyingTo(null);
            fetchChats();
        } catch (e) { }
    };

    const handleCancelReplyEdit = () => {
        setEditingMessage(null);
        setReplyingTo(null);
        setText(''); setFiles([]);
    };

    const handleEditClick = (msg) => {
        setEditingMessage(msg); setText(msg.text); setFiles([]);
    };

    const handleCancelEdit = () => {
        setEditingMessage(null); setText(''); setFiles([]);
    };

    const handleDeleteClick = (msgId) => setMessageToDelete(msgId);

    const confirmDelete = async (shouldDelete) => {
        if (shouldDelete && messageToDelete) {
            await deleteMessage(messageToDelete);
            fetchChats();
        }
        setMessageToDelete(null);
    };

    const handleFileChange = (e) => {
        if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 10));
    };
    const handleRemoveFile = (indexToRemove) => setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));

    const confirmDeleteChat = async (shouldDelete) => {
        if (shouldDelete && chatToDelete) {
            try {
                await chatApi.deleteChat(chatToDelete, deleteForBoth);
                setSearchParams({});
                fetchChats();
            } catch (e) { }
        }
        setChatToDelete(null);
        setDeleteForBoth(false);
    };

    const activeChatObj = chats.find(c => c.slug === dmSlug);

    const childProps = {
        isLoadingInitial, isLoadingMore, hasMore, onLoadMore: loadMoreMessages,
        onOpenInfo: () => setIsInfoModalOpen(true),
        onDeleteChatClick: () => setChatToDelete(dmSlug),
        currentUser, chats, messages, activeChat: activeChatObj, dmSlug,
        text, setText, files, editingMessage,
        handleSend, handleSelectChat, handleBackToInbox,
        handleEditClick, handleCancelEdit,
        handleDelete: handleDeleteClick,
        replyingTo, setReplyingTo, togglePin, handleCancelReplyEdit,
        handleFileChange, handleRemoveFile,
        isTyping: targetIsTyping,
        onTyping: emitTyping,
    };

    return (
        <>
            {localStorage.getItem('old_style') ? <MessagesOld {...childProps} /> : <Messages {...childProps} />}

            <ActionModal isOpen={!!messageToDelete} onClose={() => setMessageToDelete(null)} type="confirm" message={t('messages.delete_confirm')} btnSubmit={t('common.delete')} btnCancel={t('common.cancel')} onResolve={confirmDelete} />

            <ActionModal isOpen={!!chatToDelete} onClose={() => setChatToDelete(null)} type="confirm" message={<div><p>{t('messages.delete_chat_confirm')}</p><label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px', cursor: 'pointer' }}><input type="checkbox" checked={deleteForBoth} onChange={(e) => setDeleteForBoth(e.target.checked)} />{t('messages.delete_for_both')}</label></div>} btnSubmit={t('common.delete')} btnCancel={t('common.cancel')} onResolve={confirmDeleteChat} />

            <ChatInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} chat={activeChatObj} messages={messages} />
        </>
    );
}