import { useState, useEffect, useContext, useRef } from "react";
import { toast } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { useFriendship } from "./useFriendship";

export const useUserProfileLogic = (currentUser, isPreview = false) => {
    const { user } = useContext(AuthContext);
    const { addFriend, removeFriend, acceptRequest, blockUser, unblockUser } = useFriendship();

    const [status, setStatus] = useState(currentUser?.friendship_status || 'none');
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const defaultAvatar = "/defaultAvatar.jpg"; // bill gates mugshot
    const sameUser = user && currentUser && currentUser.username === user.username;

    const isBlockedByMe = !isPreview && status === 'blocked_by_me';
    const isBlockedByTarget = !isPreview && status === 'blocked_by_target';

    const displayAvatar = isBlockedByTarget 
        ? defaultAvatar 
        : (currentUser?.avatar || defaultAvatar);

    const displayBio = isBlockedByTarget
        ? `${currentUser.first_name} обмежив${currentUser.sex === 'female' ? 'ла' : ''} вам доступ до своєї сторінки.`
        : (currentUser?.bio || (isPreview ? "Ваш статус..." : "Статус не встановлено"));

    const displayBirth = isBlockedByTarget 
        ? "Приховано" 
        : (currentUser?.birth_date ? new Date(currentUser.birth_date).toLocaleDateString() : 'Не вказано');

    const displayCountry = isBlockedByTarget
        ? "Приховано"
        : (currentUser?.country ? `${currentUser.country.emoji} ${currentUser.country.name}` : 'Не вказано');

    if (isPreview) {
        return {
            sameUser: true,
            isBlockedByTarget: false,
            isBlockedByMe: false,
            loading: false,
            showMenu: false,
            setShowMenu: () => {},
            menuRef,
            displayAvatar,
            displayBio,
            displayBirth,
            displayCountry,
            handleMainBtnClick: () => {},
            handleBlockUser: () => {},
            getButtonContent: () => "",
            getBtnStyle: () => ({})
        };
    }

    useEffect(() => {
        setStatus(currentUser?.friendship_status || 'none');
    }, [currentUser]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const confirmAction = (message) => {
        return new Promise((resolve) => {
            toast((t) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{fontSize: '14px'}}>{message}</span>
                    <div style={{display:'flex', gap: '5px'}}>
                        <button onClick={() => { toast.dismiss(t.id); resolve(true); }} style={{ padding: '5px 10px', background: '#d33', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '12px'}}>Так</button>
                        <button onClick={() => { toast.dismiss(t.id); resolve(false); }} style={{ padding: '5px 10px', background: '#555', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '12px'}}>Ні</button>
                    </div>
                </div>
            ), { duration: 5000, style: { minWidth: '300px' } });
        });
    };

    const handleMainBtnClick = async () => {
        if (loading) return;
        setLoading(true);
        let result;

        try {
            if (isBlockedByMe) {
                result = await unblockUser(currentUser.username);
                if (result.success) setStatus('none');
            } 
            else if (status === 'none') {
                result = await addFriend(currentUser.username);
                if (result.success) setStatus('pending_sent');
            }
            else if (status === 'pending_sent') {
                result = await removeFriend(currentUser.username);
                if (result.success) setStatus('none');
            }
            else if (status === 'pending_received') {
                result = await acceptRequest(currentUser.username);
                if (result.success) setStatus('friends');
            }
            else if (status === 'friends') {
                const isConfirmed = await confirmAction("Видалити користувача з друзів?");
                if (!isConfirmed) { setLoading(false); return; }
                result = await removeFriend(currentUser.username);
                if (result.success) setStatus('none');
            }

            if (result?.success) {
                if (status === 'none') toast.success(result.message);
            } else if (result) {
                toast.error(result.message);
            }
        } catch (e) {
            toast.error("Сталася помилка");
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async () => {
        setShowMenu(false);
        const isConfirmed = await confirmAction(`Заблокувати @${currentUser.username}?`);
        if (!isConfirmed) return;

        setLoading(true);
        const result = await blockUser(currentUser.username);
        setLoading(false);

        if (result.success) {
            setStatus('blocked_by_me');
            toast.success("Користувача заблоковано");
        } else {
            toast.error(result.message);
        }
    };

    const getButtonContent = () => {
        if (loading) return "...";
        if (isBlockedByMe) return "Розблокувати";
        switch (status) {
            case 'friends': return "У вас в друзях ✓";
            case 'pending_sent': return "Скасувати заявку";
            case 'pending_received': return "Прийняти заявку";
            case 'none': default: return "Додати у друзі";
        }
    };

    const getBtnStyle = () => {
        if (isBlockedByMe) return { backgroundColor: '#d33', color: '#fff' };
        if (status === 'pending_sent' || status === 'friends') return { backgroundColor: '#444', color: '#aaa' };
        if (status === 'pending_received') return { backgroundColor: '#28a745', color: '#fff' };
        return {}; 
    };

    return {
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
    };
};