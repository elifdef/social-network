import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostMedia } from "../post/hooks/usePostMedia";
import { usePostForm } from "./hooks/usePostForm";
import { notifyError } from "../common/Notify";
import Textarea from "../UI/Textarea";
import AttachBar from './components/AttachBar';
import FormatBar from './components/FormatBar';
import MediaPreviews from './components/MediaPreviews';
import YouTubePreviews from './components/YouTubePreviews';
import PollCreator from './components/PollCreator';

export default function CreatePostForm({ onSubmitSuccess }) {
    const { t } = useTranslation();
    const [content, setContent] = useState('');
    const [removedPreviews, setRemovedPreviews] = useState([]);

    const [pollData, setPollData] = useState(null);
    const [showPollCreator, setShowPollCreator] = useState(false);

    const { external } = usePostMedia(content, [], { removed_previews: removedPreviews });

    const {
        files, previews, isDragging,
        handleDragOver, handleDragLeave, handleDrop,
        handleFileSelect, handlePaste, removeFile, clearFiles
    } = usePostForm(0);

    const toggleYouTubePreview = (videoId) => {
        setRemovedPreviews(prev =>
            prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
        );
    };

    const handleSubmit = async () => {
        if (!content.trim() && files.length === 0 && !pollData) {
            notifyError(t('post.empty_post'));
            return;
        }

        const entities = { removed_previews: removedPreviews };
        if (pollData) {
            entities.poll = pollData;
        }

        const success = await onSubmitSuccess(content, files, entities);

        if (success) {
            setContent('');
            setRemovedPreviews([]);
            setPollData(null);
            clearFiles();
        }
    };

    return (
        <div
            className={`socnet-wall-input ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <FormatBar />

            <Textarea
                className="socnet-form-textarea fixed-size"
                placeholder={isDragging ? t('wall.drop_files_here') : t('wall.write_post')}
                value={content}
                onChange={e => setContent(e.target.value)}
                onPaste={handlePaste}
                maxLength={2048}
            />

            {pollData && (
                <div
                    className="socnet-attached-poll-preview"
                    onClick={() => setShowPollCreator(true)}
                    title={t('poll.click_to_edit')}
                >
                    <span className="socnet-poll-preview-title">📊 {pollData.question}</span>
                    <button
                        type="button"
                        className="socnet-remove-poll-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPollData(null);
                        }}
                        title={t('poll.remove_poll')}
                    >
                        ✖
                    </button>
                </div>
            )}

            <MediaPreviews previews={previews} onRemove={removeFile} />

            <YouTubePreviews
                youtubeLinks={external.youtube}
                removedPreviews={removedPreviews}
                onToggle={toggleYouTubePreview}
            />

            <div className="socnet-wall-actions">
                <div className="socnet-wall-actions-left">
                    <AttachBar onFileSelect={handleFileSelect} />

                    {!pollData && (
                        <button
                            className="socnet-add-poll-btn"
                            onClick={() => setShowPollCreator(true)}
                            title={t('poll.add_poll')}
                        >
                            📊
                        </button>
                    )}
                </div>

                <button className="socnet-btn" onClick={handleSubmit}>
                    {t('wall.send_btn')}
                </button>
            </div>

            {showPollCreator && (
                <div className="socnet-poll-modal-overlay">
                    <div className="socnet-poll-modal-content">
                        <PollCreator
                            initialData={pollData}
                            onSave={(data) => {
                                setPollData(data);
                                setShowPollCreator(false);
                            }}
                            onCancel={() => setShowPollCreator(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}