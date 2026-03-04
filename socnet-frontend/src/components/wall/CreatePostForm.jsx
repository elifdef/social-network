import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageAttach from '../../assets/ImageAttach.svg?react';
import Textarea from "../UI/Textarea";
import { notifyError } from "../common/Notify";
import { validateImageFile } from "../../services/upload";
import { MAX_FILE_SIZE_KB } from "../../config";

export default function CreatePostForm({ onSubmitSuccess }) {
    const { t } = useTranslation();

    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const addFiles = (filesList) => {
        const rawFiles = Array.from(filesList).filter(validateImageFile);
        const validFiles = [];
        let hasOversized = false;

        rawFiles.forEach(file => {
            if (file.size > MAX_FILE_SIZE_KB * 1024)
                hasOversized = true;
            else
                validFiles.push(file);
        });

        if (hasOversized)
            notifyError(t('error.file_too_large', { size: MAX_FILE_SIZE_KB / 1024}));

        if (images.length + validFiles.length > 10) {
            notifyError(t('error.max_files_10'));
            return;
        }

        if (validFiles.length === 0) return;

        setImages(prev => [...prev, ...validFiles]);
        setPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleFileSelect = (e) => {
        addFiles(e.target.files);
        e.target.value = null;
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        const pastedFiles = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                pastedFiles.push(items[i].getAsFile());
            }
        }
        if (pastedFiles.length > 0) {
            e.preventDefault();
            addFiles(pastedFiles);
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[indexToRemove]);
            return prev.filter((_, idx) => idx !== indexToRemove);
        });
    };

    const handleSubmit = async () => {
        if (!content.trim() && images.length === 0) {
            notifyError(t('post.empty_post'));
            return;
        }

        const success = await onSubmitSuccess(content, images);

        if (success) {
            setContent('');
            setImages([]);
            previews.forEach(url => URL.revokeObjectURL(url));
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
                placeholder={isDragging ? t('wall.drop_image') : t('wall.write_post')}
                value={content}
                onChange={e => setContent(e.target.value)}
                onPaste={handlePaste}
                maxLength={2048}
            />

            {previews.length > 0 && (
                <div className="socnet-post-previews-container">
                    {previews.map((preview, index) => (
                        <div key={index} className="socnet-post-preview new">
                            <img src={preview} alt={`Preview ${index}`} />
                            <button className="socnet-preview-remove-btn" onClick={() => removeImage(index)}>×</button>
                        </div>
                    ))}
                </div>
            )}

            <div className="socnet-wall-actions">
                <label className="socnet-attach-btn" title={t('wall.attach_photo')}>
                    <input type="file" multiple hidden onChange={handleFileSelect} accept="image/*" />
                    <ImageAttach width={20} height={20} />
                </label>
                <button className="socnet-btn-small" onClick={handleSubmit}>
                    {t('wall.send_btn')}
                </button>
            </div>
        </div>
    );
}