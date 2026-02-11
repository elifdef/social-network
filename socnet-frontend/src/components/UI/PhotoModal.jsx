import { useEffect, useState } from "react";
import CommentsSection from "../comments/CommentsSection";
import PostFooter from "../post/PostFooter";
import { usePostLike } from "../../hooks/usePostLike";
import PostHeader from "../post/PostHeader";
import PostContent from "../post/PostContent";

export default function PhotoModal({ isOpen, image, post, onClose, onUpdate }) {
    const [modalPost, setModalPost] = useState(post);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    useEffect(() => {
        setModalPost(post);
    }, [post]);

    const { handleLike } = usePostLike(modalPost);

    const handleModalLike = async () => {
        const result = await handleLike();

        if (result) {
            // оновлюємо локальну модалку
            setModalPost(prev => ({
                ...prev,
                is_liked: result.liked,
                likes_count: result.likes_count
            }));

            // оновлюємо батька
            if (onUpdate) {
                onUpdate({
                    is_liked: result.liked,
                    likes_count: result.likes_count
                });
            }
        }
    };

    const handleCommentCountChange = (amount) => {
        setModalPost(prev => {
            const newCount = prev.comments_count + amount;
            return {
                ...prev,
                comments_count: newCount
            };
        });

        if (onUpdate) {
            onUpdate({ comments_count: modalPost.comments_count + amount });
        }
    };

    if (!isOpen || !modalPost)
        return null;

    return (
        <div className="vk-modal-overlay" onClick={onClose}>
            <button className="vk-modal-close" onClick={onClose}>
                ✕
            </button>

            <div className="vk-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="vk-modal-image-wrapper">
                    <img src={image} className="vk-modal-image" />
                </div>

                <div className="vk-modal-info">
                    <PostHeader
                        post={modalPost}
                        isOwner={false}
                    />

                    <PostContent style={{ paddingLeft: "60px" }}
                        content={modalPost.content}
                    />

                    <PostFooter
                        style={{marginTop: '20px'}}
                        postId={modalPost.id}
                        isLiked={modalPost.is_liked}
                        likesCount={modalPost.likes_count}
                        commentsCount={modalPost.comments_count}
                        onLike={handleModalLike}
                    />

                    <CommentsSection
                        postId={modalPost.id}
                        onCountChange={handleCommentCountChange}
                    />
                </div>
            </div>
        </div>
    );
}