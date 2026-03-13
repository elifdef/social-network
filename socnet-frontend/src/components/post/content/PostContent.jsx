import { useState } from "react";
import { usePostMedia } from "../hooks/usePostMedia";
import RichText from "./RichText";
import PostGallery from "./PostGallery";
import PostVideos from "./PostVideos";
import PostDocuments from "./PostDocuments";
import PostPoll from "./PostPoll";
import PhotoModal from "../../UI/PhotoModal";

export default function PostContent({ content: originalContent, post, onUpdate, isOwner, className }) {
    const { content, local, external } = usePostMedia(originalContent, post?.attachments, post?.entities);
    const [selectedMediaId, setSelectedMediaId] = useState(null);

    return (
        <div className={`socnet-post-content ${className || ''}`}>
            <RichText text={content} />
            {post?.poll && (
                <PostPoll poll={post.poll} postId={post.id} isOwner={isOwner} />
            )}
            <PostGallery images={local.images} onMediaClick={setSelectedMediaId} />
            <PostVideos localVideos={local.videos} youtubeVideos={external.youtube} onMediaClick={setSelectedMediaId} />
            <PostDocuments documents={local.documents} />

            {selectedMediaId !== null && (
                <PhotoModal
                    isOpen={selectedMediaId !== null}
                    mediaId={selectedMediaId}
                    post={post}
                    onClose={() => setSelectedMediaId(null)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
}