import { useState, useEffect } from "react";
import { usePostLike } from "../../hooks/usePostLike";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostFooter from "./PostFooter";

export default function PostItem({ post, onEdit, onDelete, isOwner, onLikeToggle }) {
    const [postData, setPostData] = useState(post);

    useEffect(() => {
        setPostData(post);
    }, [post]);

    const { handleLike } = usePostLike(postData);

    const handlePostUpdate = (updates) => {
        setPostData(prev => ({ ...prev, ...updates }));
    };

    const handleWallLike = async () => {
        const result = await handleLike();

        if (result) {
            setPostData(prev => ({
                ...prev,
                is_liked: result.liked,
                likes_count: result.likes_count
            }));

            if (onLikeToggle)
                onLikeToggle(postData.id, result.liked);
        }
    };

    return (
        <div className="socnet-post">
            <PostHeader
                post={postData}
                isOwner={isOwner}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            <PostContent
                content={postData.content}
                image={postData.image}
                post={postData}
                onUpdate={handlePostUpdate}
            />

            <PostFooter
                postId={postData.id}
                isLiked={postData.is_liked}
                likesCount={postData.likes_count}
                commentsCount={postData.comments_count}
                onLike={handleWallLike}
            />
        </div>
    );
}