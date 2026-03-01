import { useState } from "react";
import SendIcon from "../../assets/sendComment.svg?react";

export default function CommentForm({ user, onSubmit, placeholder }) {
    const [text, setText] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        const success = await onSubmit(text);
        if (success)
            setText("");
    };

    return (
        <form className="socnet-comment-form" onSubmit={handleSubmit}>
            {user && (
                <>
                    <img
                        src={user.avatar}
                        alt={user.username}
                        className="socnet-comment-avatar"
                    />

                    <div className="socnet-comment-input-wrapper">
                        <input
                            type="text"
                            className="socnet-comment-input"
                            placeholder={placeholder}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        <button type="submit" className="socnet-send-btn" disabled={!text.trim()}>
                            <SendIcon width={16} height={16} />
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}