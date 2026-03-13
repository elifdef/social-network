import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notifyError } from "../common/Notify";
import { usePostMedia } from "../post/hooks/usePostMedia";
import { usePostForm } from "./hooks/usePostForm";
import Textarea from "../UI/Textarea";
import Button from "../UI/Button";
import AttachBar from './components/AttachBar';
import FormatBar from './components/FormatBar';
import MediaPreviews from './components/MediaPreviews';
import YouTubePreviews from './components/YouTubePreviews';

export default function EditPostForm({ post, saveEdit, cancelEditing }) {
    const { t } = useTranslation();

    const [editContent, setEditContent] = useState(post.content || '');
    const [existingMedia, setExistingMedia] = useState(post.attachments || []);
    const [deletedMediaIds, setDeletedMediaIds] = useState([]);
    const [removedPreviews, setRemovedPreviews] = useState([]);

    useEffect(() => {
        if (post?.entities?.removed_previews) {
            setRemovedPreviews(post.entities.removed_previews);
        }
    }, [post]);

    const { external } = usePostMedia(editContent, [], { removed_previews: removedPreviews });

    const {
        files: newFiles,
        previews: newPreviews,
        isDragging, handleDragOver, handleDragLeave, handleDrop,
        handleFileSelect, handlePaste, removeFile: removeNewFile
    } = usePostForm(existingMedia.length);

    const removeExistingMedia = (mediaId) => {
        setExistingMedia(prev => prev.filter(media => media.id !== mediaId));
        setDeletedMediaIds(prev => [...prev, mediaId]);
    };

    const toggleYouTubePreview = (videoId) => {
        setRemovedPreviews(prev =>
            prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
        );
    };

    const handleSave = () => {
        const hasPoll = !!post?.entities?.poll;

        if (!editContent.trim() && existingMedia.length === 0 && newFiles.length === 0 && !hasPoll) {
            notifyError(t('post.empty_post'));
            return;
        }

        const entities = {
            ...(post.entities || {}),
            removed_previews: removedPreviews
        };

        saveEdit(post.id, {
            content: editContent,
            images: newFiles,
            deletedMedia: deletedMediaIds,
            entities
        });
    };

    return (
        <div
            className={`socnet-post socnet-edit-mode ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <FormatBar />

            <Textarea
                className="socnet-form-textarea fixed-size"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onPaste={handlePaste}
                maxLength={2048}
            />

            {post?.entities?.poll && (
                <div className="socnet-attached-poll-preview disabled">
                    <span>📊 {post.entities.poll.question}</span>
                    <span className="socnet-poll-locked-text">{t('poll.edit_locked')}</span>
                </div>
            )}

            <MediaPreviews previews={existingMedia} onRemove={removeExistingMedia} isExisting={true} />

            <MediaPreviews previews={newPreviews} onRemove={removeNewFile} />

            <YouTubePreviews
                youtubeLinks={external.youtube}
                removedPreviews={removedPreviews}
                onToggle={toggleYouTubePreview}
            />

            <div className="socnet-edit-actions" style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <AttachBar onFileSelect={handleFileSelect} />

                <div className="socnet-edit-buttons-right" style={{ display: 'flex', gap: '8px' }}>
                    <Button className="socnet-btn-small" onClick={handleSave}>
                        {t('common.save')}
                    </Button>
                    <Button className="socnet-btn-small socnet-btn-cancel" onClick={cancelEditing}>
                        {t('common.cancel')}
                    </Button>
                </div>
            </div>
        </div>
    );
}