import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Textarea from "../UI/Textarea";
import Button from "../UI/Button";
import VideoPlayer from "../UI/VideoPlayer";
import { usePostMedia } from "../../hooks/usePostMedia";

import ImageAttach from '../../assets/imageAttach.svg?react';
import VideoAttach from '../../assets/videoAttach.svg?react';
import AudioAttach from '../../assets/audioAttach.svg?react';
import DocumentAttach from '../../assets/documentAttach.svg?react';
import FileIcon from '../../assets/documentAttach.svg?react';

export default function EditPostForm({
    post,
    editContent, setEditContent,
    existingMedia = [],
    newEditPreviews = [],
    removeExistingMedia,
    removeNewEditImage,
    handleEditFileSelect, handlePaste,
    saveEdit, cancelEditing
}) {
    const { t } = useTranslation();
    const [removedPreviews, setRemovedPreviews] = useState([]);

    useEffect(() => {
        if (post?.entities?.removed_previews) {
            setRemovedPreviews(post.entities.removed_previews);
        }
    }, [post]);

    const { external } = usePostMedia(editContent, [], { removed_previews: removedPreviews });

    const handleSave = () => {
        const entities = JSON.stringify({ removed_previews: removedPreviews });

        saveEdit(post.id, entities);
    };

    return (
        <div className="socnet-post">
            <div className="socnet-edit-mode">
                <Textarea
                    className="socnet-form-textarea fixed-size"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onPaste={(e) => handlePaste(e, 'edit')}
                    maxLength={2048}
                />

                {(existingMedia.length > 0 || newEditPreviews.length > 0) && (
                    <div className="socnet-post-previews-container">
                        {existingMedia.map((media) => (
                            <div key={`exist-${media.id}`} className="socnet-post-preview existing">
                                {media.type === 'image' ? (
                                    <img src={media.url} alt="Existing Preview" />
                                ) : media.type === 'video' ? (
                                    <video src={media.url} muted className="socnet-preview-video" />
                                ) : (
                                    <div className="socnet-preview-file-stub">
                                        <FileIcon width={24} height={24} />
                                        <span className="socnet-preview-filename" title={media.original_name}>
                                            {media.original_name || 'File'}
                                        </span>
                                    </div>
                                )}
                                <Button className="socnet-preview-close" onClick={() => removeExistingMedia(media.id)}>×</Button>
                            </div>
                        ))}

                        {newEditPreviews.map((preview, index) => {
                            const isImage = preview.type.startsWith('image/');
                            const isVideo = preview.type.startsWith('video/');

                            return (
                                <div key={`new-${index}`} className="socnet-post-preview new">
                                    {isImage ? (
                                        <img src={preview.url} alt="New Preview" />
                                    ) : isVideo ? (
                                        <video src={preview.url} muted className="socnet-preview-video" />
                                    ) : (
                                        <div className="socnet-preview-file-stub">
                                            <FileIcon width={24} height={24} />
                                            <span className="socnet-preview-filename" title={preview.name}>
                                                {preview.name}
                                            </span>
                                        </div>
                                    )}
                                    <Button className="socnet-preview-close" onClick={() => removeNewEditImage(index)}>×</Button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {external.youtube.length > 0 && (
                    <div className="socnet-post-videos-container">
                        {external.youtube.map(yt => {
                            const isAttached = !removedPreviews.includes(yt.videoId);

                            return (
                                <div key={`preview-${yt.id}`} className="socnet-preview-youtube-wrapper">

                                    <label
                                        className="socnet-youtube-checkbox-overlay"
                                        title={t('wall.attach_video_preview', 'Прикріпити прев\'ю відео')}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isAttached}
                                            onChange={() => {
                                                setRemovedPreviews(prev =>
                                                    prev.includes(yt.videoId)
                                                        ? prev.filter(id => id !== yt.videoId)
                                                        : [...prev, yt.videoId]
                                                );
                                            }}
                                        />
                                    </label>

                                    <div style={{
                                        opacity: isAttached ? 1 : 0.4,
                                        pointerEvents: isAttached ? 'auto' : 'none',
                                        transition: 'opacity 0.2s ease',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <VideoPlayer src={yt.videoId} provider="youtube" />
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="socnet-edit-actions">
                    <div className="socnet-attach-buttons-edit">
                        <label className="socnet-action-icon" title={t('common.photo')}>
                            <input type="file" multiple hidden accept="image/*" onChange={handleEditFileSelect} />
                            <ImageAttach width={20} height={20} />
                        </label>
                        <label className="socnet-action-icon" title={t('common.video')}>
                            <input type="file" multiple hidden accept="video/*" onChange={handleEditFileSelect} />
                            <VideoAttach width={20} height={20} />
                        </label>
                        <label className="socnet-action-icon" title={t('common.audio')}>
                            <input type="file" multiple hidden accept="audio/*" onChange={handleEditFileSelect} />
                            <AudioAttach width={20} height={20} />
                        </label>
                        <label className="socnet-action-icon" title={t('common.document')}>
                            <input type="file" multiple hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" onChange={handleEditFileSelect} />
                            <DocumentAttach width={20} height={20} />
                        </label>
                    </div>

                    <div className="socnet-edit-buttons-right">
                        <Button className="socnet-btn-small" onClick={handleSave}>
                            {t('common.save')}
                        </Button>

                        <Button className="socnet-btn-small socnet-btn-cancel" onClick={cancelEditing}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}