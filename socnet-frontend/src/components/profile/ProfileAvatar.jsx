export default function ProfileAvatar({ user, isPreview, isBlocked }) {
    return (
        <div className="socnet-photo-box">
            <img
                src={user.avatar}
                alt={user.username}
                className={`socnet-avatar ${(!isPreview && isBlocked) ? 'socnet-avatar-blocked' : ''}`}
            />
        </div>
    );
}