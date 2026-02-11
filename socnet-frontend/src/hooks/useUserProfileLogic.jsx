import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { useFriendship } from "./useFriendship";
import { notifyConfirmAction, notifyError, notifyInfo, notifySuccess } from "../components/Notify";
import { useTranslation } from 'react-i18next';

export const useUserProfileLogic = (currentUser, isPreview = false) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const { addFriend, removeFriend, acceptRequest, blockUser, unblockUser } = useFriendship();

    const [status, setStatus] = useState(currentUser?.friendship_status || 'none');
    const [loading, setLoading] = useState(false);

    const sameUser = user && currentUser && currentUser.username === user.username;
    const isBlockedByMe = !isPreview && status === 'blocked_by_me';
    const isBlockedByTarget = !isPreview && status === 'blocked_by_target';
    const isFriend = status === 'friends';
    const displayAvatar = currentUser?.avatar;

    const getDisplayBio = () => {
        if (isBlockedByTarget) {
            return t('profile.restricted_profile_' + (currentUser?.gender === 2 ? "f" : "m"), { name: currentUser.first_name })
        }

        if (currentUser?.bio) return currentUser.bio;

        return isPreview
            ? t('profile.your_status')
            : <span style={{ color: '#999' }}>{t('profile.status_not_set')}</span>;
    };

    const getField = (value, formatter = null) => {
        if (isBlockedByTarget)
            return t('profile.hidden');

        if (!value)
            return t('profile.not_specified');

        return formatter ? formatter(value) : value;
    };

    const displayBirth = getField(currentUser?.birth_date);
    const displayCountry = getField(currentUser?.country, (c) => `${c.emoji} ${c.name}`);
    const displayBio = getDisplayBio();
    const displayGender = getField(currentUser?.gender, (g) => {
        if (g === 1) return t('common.gender_male');
        if (g === 2) return t('common.gender_female');
        return t('settings.not_selected');
    });

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
                    if (await notifyConfirmAction(t('friends.remove_friends') + "?")) {
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
            notifyError(t('common.error'));
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
                notifyInfo(t('friends.user_unblocked'));
            } else {
                notifyError(result.message);
            }
            setLoading(false);
            return;
        }

        // якщо ні - блокуємо
        if (await notifyConfirmAction(`${t('common.to_block')} @${currentUser.username}?`)) {
            setLoading(true);
            const result = await blockUser(currentUser.username);
            if (result.success) {
                setStatus('blocked_by_me');
                notifyInfo(t('friends.user_blocked'));
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
        displayGender,
        // функції дій
        handleFriendshipAction,
        handleBlockAction
    };
};