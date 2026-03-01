import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostItem from "../components/post/PostItem";
import { usePageTitle } from "../hooks/usePageTitle";
import { AuthContext } from "../context/AuthContext";
import CommentsSection from "../components/comments/CommentsSection";
import { useTranslation } from 'react-i18next';
import postService from "../services/post.service";

export default function PostPage() {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    usePageTitle(t('common.post'));

    useEffect(() => {
        const fetchPosts = async (id) => {
            try {
                const res = await postService.get(id);
                setPost(res);
            } catch (err) {
                setError(err.response?.status === 404 ? t('post.not_found') : t('error.connection'));
            } finally {
                setLoading(false)
            };
        }
        fetchPosts(id);
    }, [id])

    const handleCommentCountChange = (amount) => {
        setPost(prev => {
            if (!prev)
                return prev;

            return {
                ...prev,
                comments_count: prev.comments_count + amount
            };
        });
    };

    if (loading)
        return (<div style={{ padding: 20 }}>{t('common.loading')}</div>);

    if (error)
        return (
            <div className="socnet-empty-state with-card">
                <h3>{error}</h3>
                <p>{t('error.loading_post')}</p>
                <div className="socnet-feed-actions">
                    <button
                        className="socnet-btn-small"
                        onClick={() => window.location.reload()}
                    >
                        {t('common.reload_page')}
                    </button>
                </div>
            </div>
        );

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: 50 }}>
            {user && (
                <button
                    onClick={() => navigate(-1)}
                    style={{ border: 'none', background: 'none', color: '#2a5885', cursor: 'pointer', marginBottom: 10 }}
                >{t('common.back')}</button>
            )}

            <PostItem post={post} />

            <div style={{ borderTop: '1px solid var(--theme-border)' }}>
                <CommentsSection
                    postId={post.id}
                    onCountChange={handleCommentCountChange}
                />
            </div>
        </div>
    );
}