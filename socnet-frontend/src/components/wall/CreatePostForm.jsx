import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageAttach from '../../assets/ImageAttach.svg?react';
import Textarea from "../UI/Textarea";
import { notifyError } from "../common/Notify";
import { validateImageFile } from "../../services/upload";

export default function CreatePostForm({ onSubmitSuccess }) {
    const { t } = useTranslation();

    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const setFileState = (file) => {
        if (!file) return;
        if (!validateImageFile(file)) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setFileState(e.dataTransfer.files[0]);
    };

    const handleFileSelect = (e) => setFileState(e.target.files[0]);

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                setFileState(file);
                e.preventDefault();
                return;
            }
        }
    };

    const removeImage = () => { setImage(null); setPreview(null); };

    const handleSubmit = async () => {
        if (!content.trim() && !image) {
            notifyError(t('post.empty_post'));
            return;
        }

        const success = await onSubmitSuccess(content, image);

        if (success) {
            setContent('');
            setImage(null);
            setPreview(null);
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
            ></Textarea>

            {preview && (
                <div className="socnet-post-preview">
                    <img src={preview} alt="Preview" />
                    <button onClick={removeImage}>×</button>
                </div>
            )}

            <div className="socnet-wall-actions">
                <label className="socnet-attach-btn" title={t('wall.attach_photo')}>
                    <input type="file" hidden onChange={handleFileSelect} accept="image/*" />
                    <ImageAttach width={20} height={20} />
                </label>
                <button className="socnet-btn-small" onClick={handleSubmit}>
                    {t('wall.send_btn')}
                </button>
            </div>
        </div>
    );
}