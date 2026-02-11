import { useTranslation } from 'react-i18next';

export default function EditPostForm({
    post,
    editContent, setEditContent,
    editPreview, removeEditImage,
    handleEditFileSelect, handlePaste,
    saveEdit, cancelEditing
}) {
    const { t } = useTranslation();

    return (
        <div className="vk-post">
            <div className="vk-edit-mode">
                <textarea
                    className="vk-edit-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onPaste={(e) => handlePaste(e, 'edit')}
                    maxLength={2048}
                />

                {editPreview && (
                    <div className="vk-post-preview">
                        <img src={editPreview} />
                        <button onClick={removeEditImage}>×</button>
                    </div>
                )}

                <div className="vk-edit-actions">
                    <label className="vk-btn-small" style={{ marginRight: 5, background: '#8292a4', cursor: 'pointer' }}>
                        {t('common.photo')}
                        <input type="file" hidden onChange={handleEditFileSelect} />
                    </label>

                    <button className="vk-btn-small" onClick={() => saveEdit(post.id)}>{t('common.save')}</button>
                    <button
                        className="vk-btn-small"
                        style={{ background: 'transparent', color: '#777', border: '1px solid #ccc', marginLeft: 5 }}
                        onClick={cancelEditing}
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}