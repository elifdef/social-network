import { useTranslation } from 'react-i18next';
import Textarea from "../UI/Textarea"

export default function EditPostForm({
    post,
    editContent, setEditContent,
    editPreview, removeEditImage,
    handleEditFileSelect, handlePaste,
    saveEdit, cancelEditing
}) {
    const { t } = useTranslation();

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

                {editPreview && (
                    <div className="socnet-post-preview">
                        <img src={editPreview} />
                        <button onClick={removeEditImage}>×</button>
                    </div>
                )}

                <div className="socnet-edit-actions">
                    <label className="socnet-btn-small" style={{ marginRight: 5, background: '#8292a4', cursor: 'pointer' }}>
                        {t('common.photo')}
                        <input type="file" hidden onChange={handleEditFileSelect} />
                    </label>

                    <button className="socnet-btn-small" onClick={() => saveEdit(post.id)}>{t('common.save')}</button>
                    <button
                        className="socnet-btn-small"
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