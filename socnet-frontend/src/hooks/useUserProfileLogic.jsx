import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useFriendship } from "./useFriendship";
import { notifyConfirmAction, notifyError, notifyInfo, notifySuccess } from "../components/Notify";

export const useUserProfileLogic = (currentUser, isPreview = false) => {
    const { user } = useContext(AuthContext);
    const { addFriend, removeFriend, acceptRequest, blockUser, unblockUser } = useFriendship();

    const [status, setStatus] = useState(currentUser?.friendship_status || 'none');
    const [loading, setLoading] = useState(false);

    const sameUser = user && currentUser && currentUser.username === user.username;
    const isBlockedByMe = !isPreview && status === 'blocked_by_me';
    const isBlockedByTarget = !isPreview && status === 'blocked_by_target';
    const isFriend = status === 'friends';

    const defaultAvatar = "/defaultAvatar.jpg"; // bill gates mugshot

    const displayAvatar = isBlockedByTarget ? defaultAvatar : (currentUser?.avatar || defaultAvatar);

    const displayBio = isBlockedByTarget
        ? `${currentUser.first_name} обмежив${currentUser.sex === 'female' ? 'ла' : ''} вам доступ до своєї сторінки.`
        : (currentUser?.bio || (isPreview ? "Ваш статус..." : "Статус не встановлено"));

    const displayBirth = isBlockedByTarget ? "Приховано" : (currentUser?.birth_date ? new Date(currentUser.birth_date).toLocaleDateString() : 'Не вказано');
    const displayCountry = isBlockedByTarget ? "Приховано" : (currentUser?.country ? `${currentUser.country.emoji} ${currentUser.country.name}` : 'Не вказано');

    useEffect(() => {
        setStatus(currentUser?.friendship_status || 'none');
    }, [currentUser]);

    const handleFriendshipAction = async () => {
        if (loading) return;
        setLoading(true);
        let result;

        try {
            switch (status) {
                case 'none':
                    result = await addFriend(currentUser.username);
                    if (result.success) setStatus('pending_sent');
                    break;
                case 'pending_sent':
                    result = await removeFriend(currentUser.username); // Скасувати
                    if (result.success) setStatus('none');
                    break;
                case 'pending_received':
                    result = await acceptRequest(currentUser.username);
                    if (result.success) setStatus('friends');
                    break;
                case 'friends':
                    if (await notifyConfirmAction("Видалити з друзів?")) {
                        result = await removeFriend(currentUser.username);
                        if (result.success) setStatus('none');
                    } else {
                        setLoading(false);
                        return;
                    }
                    break;
                default:
                    break;
            }

            if (result?.success) {
                if (status === 'none') notifySuccess(result.message);
            } else if (result) {
                notifyError(result.message);
            }
        } catch (e) {
            console.error(e);
            notifyError("Помилка");
        } finally {
            setLoading(false);
        }
    };

    const handleBlockAction = async () => {
        if (loading) return;

        // якщо вже заблоковано - розблоковуємо
        if (isBlockedByMe) {
            setLoading(true);
            const result = await unblockUser(currentUser.username);
            if (result.success) {
                setStatus('none');
                notifyInfo("Користувача розблоковано");
            } else {
                notifyError(result.message);
            }
            setLoading(false);
            return;
        }

        // якщо ні - блокуємо
        if (await notifyConfirmAction(`Заблокувати @${currentUser.username}?`)) {
            setLoading(true);
            const result = await blockUser(currentUser.username);
            if (result.success) {
                setStatus('blocked_by_me');
                notifyInfo("Користувача заблоковано");
            } else {
                notifyError(result.message);
            }
            setLoading(false);
        }
    };

    return {
        // стани
        status,
        loading,
        sameUser,
        isBlockedByMe,
        isBlockedByTarget,
        isFriend,
        // дані
        displayAvatar,
        displayBio,
        displayBirth,
        displayCountry,
        // функції дій
        handleFriendshipAction,
        handleBlockAction
    };
};