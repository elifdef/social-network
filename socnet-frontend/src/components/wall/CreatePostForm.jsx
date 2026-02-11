import ImageAttach from '../../assets/ImageAttach.svg?react';
import { useTranslation } from 'react-i18next';

export default function CreatePostForm({
    content, setContent,
    preview, removeImage,
    isDragging, handleDragOver, handleDragLeave, handleDrop,
    handleFileSelect, handlePaste, handleSubmit
}) {
    const { t } = useTranslation();

    return (
        <div
            className={`vk-wall-input ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <textarea
                placeholder={isDragging ? t('wall.drop_image') : t('wall.write_post')}
                value={content}
                onChange={e => setContent(e.target.value)}
                onPaste={(e) => handlePaste(e, 'create')}
                maxLength={2048}
            ></textarea>

            {preview && (
                <div className="vk-post-preview">
                    <img src={preview} alt="Preview" />
                    <button onClick={removeImage}>×</button>
                </div>
            )}

            <div className="vk-wall-actions">
                <label className="vk-attach-btn" title={t('wall.attach_photo')}>
                    <input type="file" hidden onChange={handleFileSelect} accept="image/*" />
                    <ImageAttach width={20} height={20} />
                </label>
                <button className="vk-btn-small" onClick={handleSubmit}>
                    {t('wall.send_btn')}
                </button>
            </div>
        </div>
    );
}