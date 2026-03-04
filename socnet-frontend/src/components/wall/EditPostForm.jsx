import { useTranslation } from 'react-i18next';
import Textarea from "../UI/Textarea";
import Button from "../UI/Button";

export default function EditPostForm({
    post,
    editContent, setEditContent,
    existingMedia = [],      // масив старих обєктів з бекенда
    newEditPreviews = [],    // масив превюшок для нових файлів
    removeExistingMedia,     
    removeNewEditImage,      
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

                {(existingMedia.length > 0 || newEditPreviews.length > 0) && (
                    <div className="socnet-post-previews-container">
                        {/* старі картинки */}
                        {existingMedia.map((media) => (
                            <div key={`exist-${media.id}`} className="socnet-post-preview existing">
                                <img src={media.url} alt="Existing Preview" />
                                <Button className="socnet-preview-close" onClick={() => removeExistingMedia(media.id)}>
                                    ×
                                </Button>
                            </div>
                        ))}

                        {/* нові картинки */}
                        {newEditPreviews.map((previewStr, index) => (
                            <div key={`new-${index}`} className="socnet-post-preview new">
                                <img src={previewStr} alt="New Preview" />
                                <Button className="socnet-preview-close" onClick={() => removeNewEditImage(index)}>
                                    ×
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="socnet-edit-actions">
                    <label className="socnet-btn-small socnet-btn-attach">
                        {t('common.photo')}
                        <input type="file" multiple hidden accept="image/*" onChange={handleEditFileSelect} />
                    </label>

                    <Button className="socnet-btn-small" onClick={() => saveEdit(post.id)}>
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