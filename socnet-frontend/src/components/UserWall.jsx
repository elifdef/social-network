import { useContext } from 'react';
import { Link } from 'react-router-dom';
import Linkify from 'linkify-react';
import 'linkify-plugin-mention';
import { AuthContext } from '../context/AuthContext';
import { useUserWall } from '../hooks/useUserWall';
import iconImage from '/imageAttach.svg';

export default function UserWall({ profileUser, isOwnProfile }) {
    const { user: authUser } = useContext(AuthContext);

    const {
        posts,
        content, setContent, preview, isDragging,
        handleDragOver, handleDragLeave, handleDrop, handleFileSelect, handleSubmit, removeImage,
        editingPostId, editContent, setEditContent, editPreview, setEditImage, setEditPreview,
        startEditing, cancelEditing, saveEdit,
        handleDelete, getDeclension, removeEditImage
    } = useUserWall(profileUser);

    const linkifyOptions = {
        target: '_blank',
        className: 'vk-link',
        formatHref: {
            mention: (href) => `/${href.substring(1)}`, // перетворює @teto на /teto
            url: (href) => href
        }
    };

    return (
        <div className="vk-wall">
            <div className="vk-wall-header">
                <span className="vk-wall-title">Стіна</span>
                <span className="vk-wall-count">
                    {posts.length} {getDeclension(posts.length)}
                </span>
            </div>
            {isOwnProfile && (
                <div
                    className={`vk-wall-input ${isDragging ? 'drag-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <textarea
                        placeholder={isDragging ? "Відпустіть картинку сюди..." : "Написати повідомлення..."}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        maxLength={2048}
                    ></textarea>

                    {preview && (
                        <div className="vk-post-preview">
                            <img src={preview} alt="Preview" />
                            <button onClick={removeImage}>×</button>
                        </div>
                    )}

                    <div className="vk-wall-actions">
                        <label className="vk-attach-btn" title="Додати фото">
                            <input type="file" hidden onChange={handleFileSelect} accept="image/*" />
                            <img src={iconImage} alt="Attach image" />
                        </label>
                        <button className="vk-btn-small" onClick={handleSubmit}>Надіслати</button>
                    </div>
                </div>
            )}

            {posts.length === 0 ? (
                <div className="vk-wall-empty">На стіні поки немає записів.</div>
            ) : (
                <div className="vk-post-list">
                    {posts.map(post => (
                        <div key={post.id} className="vk-post">
                            {editingPostId === post.id ? (
                                <div className="vk-edit-mode">
                                    <textarea
                                        className="vk-edit-textarea"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                    />

                                    {editPreview && (
                                        <div className="vk-post-preview">
                                            <img src={editPreview} alt="Preview" />
                                            <button onClick={removeEditImage}>×</button>
                                        </div>
                                    )}

                                    <div className="vk-edit-actions">
                                        <label className="vk-btn-small" style={{ marginRight: 5, background: '#8292a4' }}>
                                            Фото
                                            <input
                                                type="file" hidden
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        setEditImage(e.target.files[0]);
                                                        setEditPreview(URL.createObjectURL(e.target.files[0]));
                                                    }
                                                }}
                                            />
                                        </label>

                                        <button className="vk-btn-small" onClick={() => saveEdit(post.id)}>Зберегти</button>
                                        <button
                                            className="vk-btn-small"
                                            style={{ background: 'transparent', color: '#777', border: '1px solid #ccc', marginLeft: 5 }}
                                            onClick={cancelEditing}
                                        >
                                            Скасувати
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="vk-post-header">
                                        <img src={post.user.avatar || '/default-avatar.png'} className="vk-post-avatar" alt="Avatar" />
                                        <div className="vk-post-meta">
                                            <Link to={`/${post.user.username}`} className="vk-post-author">
                                                {post.user.first_name} {post.user.last_name}
                                            </Link>
                                            <span className="vk-post-date">{new Date(post.created_at).toLocaleString()}</span>
                                        </div>

                                        {authUser && authUser.id === post.user.id && (
                                            <div className="vk-post-actions-top">
                                                <button className="vk-action-icon" onClick={() => startEditing(post)} title="Редагувати">
                                                    ✎
                                                </button>
                                                <button className="vk-action-icon" onClick={() => handleDelete(post.id)} title="Видалити">
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="vk-post-content">
                                        {post.content && (
                                            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                <Linkify options={linkifyOptions}>
                                                    {post.content}
                                                </Linkify>
                                            </p>
                                        )}
                                        {post.image && (
                                            <div className="vk-post-image">
                                                <img src={`http://localhost:8000/storage/${post.image}`} alt="Post" />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}