import SendIcon from "../../assets/sendComment.svg?react";

export default function CommentForm({ user, text, setText, onSubmit, placeholder }) {
    return (
        <form className="vk-comment-form" onSubmit={onSubmit}>
            {user && (
                <>
                    <img
                        src={user.avatar}
                        alt={user.username}
                        className="vk-comment-avatar"
                    />

                    <div className="vk-comment-input-wrapper">
                        <input
                            type="text"
                            className="vk-comment-input"
                            placeholder={placeholder}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        <button type="submit" className="vk-send-btn" disabled={!text.trim()}>
                            <SendIcon width={16} height={16} />
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}