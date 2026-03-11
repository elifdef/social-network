import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_FILE_SIZE_KB } from "../../config";
import { usePostMedia } from "../../hooks/usePostMedia";
import { notifyError } from "../common/Notify";
import { validateGenericFile } from "../../utils/upload";
import Textarea from "../UI/Textarea";
import VideoPlayer from "../UI/VideoPlayer";

import ImageAttach from '../../assets/imageAttach.svg?react';
import VideoAttach from '../../assets/videoAttach.svg?react';
import AudioAttach from '../../assets/audioAttach.svg?react';
import DocumentAttach from '../../assets/documentAttach.svg?react';

export default function CreatePostForm({ onSubmitSuccess }) {
    const { t } = useTranslation();

    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [removedPreviews, setRemovedPreviews] = useState([]);
    const { external } = usePostMedia(content, [], { removed_previews: removedPreviews });

    const addFiles = (filesList) => {
        const rawFiles = Array.from(filesList).filter(validateGenericFile);
        const validFiles = [];
        let hasOversized = false;

        rawFiles.forEach(file => {
            if (file.size > MAX_FILE_SIZE_KB * 1024)
                hasOversized = true;
            else
                validFiles.push(file);
        });

        if (hasOversized)
            notifyError(t('error.file_too_large', { size: MAX_FILE_SIZE_KB / 1024 }));

        if (files.length + validFiles.length > 10) {
            notifyError(t('error.max_files'));
            return;
        }

        if (validFiles.length === 0) return;

        setFiles(prev => [...prev, ...validFiles]);

        setPreviews(prev => [
            ...prev,
            ...validFiles.map(f => ({
                url: URL.createObjectURL(f),
                type: f.type,
                name: f.name
            }))
        ]);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); };

    const handleFileSelect = (e) => {
        addFiles(e.target.files);
        e.target.value = null;
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        const pastedFiles = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                pastedFiles.push(items[i].getAsFile());
            }
        }
        if (pastedFiles.length > 0) {
            e.preventDefault();
            addFiles(pastedFiles);
        }
    };

    const removeFile = (indexToRemove) => {
        setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[indexToRemove].url);
            return prev.filter((_, idx) => idx !== indexToRemove);
        });
    };

    const handleSubmit = async () => {
        if (!content.trim() && files.length === 0) {
            notifyError(t('post.empty_post'));
            return;
        }

        const entities = JSON.stringify({ removed_previews: removedPreviews });
        const success = await onSubmitSuccess(content, files, entities);

        if (success) {
            setContent('');
            setFiles([]);
            setRemovedPreviews([]);
            previews.forEach(p => URL.revokeObjectURL(p.url));
            setPreviews([]);
        }
    };

    return (
        <div
            className={`socnet-wall-input ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Textarea
                className="socnet-form-textarea fixed-size"
                placeholder={isDragging ? t('wall.drop_files_here') : t('wall.write_post')}
                value={content}
                onChange={e => setContent(e.target.value)}
                onPaste={handlePaste}
                maxLength={2048}
            />

            {previews.length > 0 && (
                <div className="socnet-post-previews-container">
                    {previews.map((preview, index) => {
                        const isImage = preview.type.startsWith('image/');
                        const isVideo = preview.type.startsWith('video/');

                        return (
                            <div key={index} className="socnet-post-preview new">
                                {isImage ? (
                                    <img src={preview.url} alt={`Preview ${index}`} />
                                ) : isVideo ? (
                                    <video src={preview.url} muted className="socnet-preview-video" />
                                ) : (
                                    <div className="socnet-preview-file-stub">
                                        <DocumentAttach width={24} height={24} />
                                        <span className="socnet-preview-filename" title={preview.name}>
                                            {preview.name}
                                        </span>
                                    </div>
                                )}
                                <button className="socnet-preview-remove-btn" onClick={() => removeFile(index)}>×</button>
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
                                    overflow: 'hidden'
                                }}>
                                    <VideoPlayer src={yt.videoId} provider="youtube" />
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            <div className="socnet-wall-actions">
                <div className="socnet-attach-buttons">
                    <label className="socnet-attach-btn" title={t('wall.attach_photo')}>
                        <input type="file" multiple hidden onChange={handleFileSelect} accept="image/*" />
                        <ImageAttach width={20} height={20} />
                    </label>
                    <label className="socnet-attach-btn" title={t('wall.attach_video')}>
                        <input type="file" multiple hidden onChange={handleFileSelect} accept="video/*" />
                        <VideoAttach width={20} height={20} />
                    </label>
                    <label className="socnet-attach-btn" title={t('wall.attach_audio')}>
                        <input type="file" multiple hidden onChange={handleFileSelect} accept="audio/*" />
                        <AudioAttach width={20} height={20} />
                    </label>
                    <label className="socnet-attach-btn" title={t('wall.attach_document')}>
                        <input type="file" multiple hidden onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" />
                        <DocumentAttach width={20} height={20} />
                    </label>
                </div>

                <button className="socnet-btn" onClick={handleSubmit}>
                    {t('wall.send_btn')}
                </button>
            </div>
        </div>
    );
}