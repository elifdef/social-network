import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../api/axios';
import { notifyError } from '../../common/Notify';
import { Link } from 'react-router-dom';

export default function PostPoll({ poll, postId, isOwner }) {
    const { t } = useTranslation();

    if (!poll) return null;

    const [results, setResults] = useState(poll.results || {});
    const [votedOptionIds, setVotedOptionIds] = useState(poll.voted_option_ids || []);
    const [draftOptionIds, setDraftOptionIds] = useState(poll.voted_option_ids || []);

    const [isClosed, setIsClosed] = useState(poll.is_closed || false);

    const [isLoading, setIsLoading] = useState(false);
    const [quizData, setQuizData] = useState(() => {
        if (poll.type === 'quiz' && poll.voted_option_ids?.length > 0) {
            return { options: poll.options, explanation: poll.explanation };
        }
        return null;
    });

    const [votersData, setVotersData] = useState(null);
    const [isVotersModalOpen, setIsVotersModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(null);
    const [isLoadingVoters, setIsLoadingVoters] = useState(false);

    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

    const totalVotes = Object.values(results).reduce((sum, current) => sum + current, 0);

    const getPercentage = (optionId) => {
        if (totalVotes === 0) return 0;
        const count = results[optionId] || 0;
        return Math.round((count / totalVotes) * 100);
    };

    const hasDraftChanges = JSON.stringify([...draftOptionIds].sort()) !== JSON.stringify([...votedOptionIds].sort());

    const handleOptionClick = (optionId) => {
        if (isLoading || isClosed) return;

        if (votedOptionIds.length > 0 && !poll.can_change_vote) return;

        if (poll.is_multiple_choice) {
            let newDraft = [...draftOptionIds];
            if (newDraft.includes(optionId)) {
                newDraft = newDraft.filter(id => id !== optionId);
            } else {
                newDraft.push(optionId);
            }
            setDraftOptionIds(newDraft);
        } else {
            if (draftOptionIds.includes(optionId)) return;
            setDraftOptionIds([optionId]);
            submitVote([optionId]);
        }
    };

    const submitVote = async (idsToSubmit) => {
        if (idsToSubmit.length === 0 || isClosed) return;

        setIsLoading(true);
        try {
            const response = await api.post(`/posts/${postId}/poll/vote`, { option_ids: idsToSubmit });
            setResults(response.data.results);
            setVotedOptionIds(response.data.voted_option_ids);
            setDraftOptionIds(response.data.voted_option_ids);

            if (response.data.quiz_data) {
                setQuizData(response.data.quiz_data);
            }
        } catch (error) {
            notifyError(error.response?.data?.message || t('error.connection'));
            setDraftOptionIds(votedOptionIds);
        } finally {
            setIsLoading(false);
        }
    };

    const cancelDraft = () => setDraftOptionIds(votedOptionIds);

    const openVotersModal = async (optionId, e) => {
        e.stopPropagation();
        if (poll.is_anonymous) return;

        setActiveTab(optionId);
        setIsVotersModalOpen(true);
        if (votersData) return;

        setIsLoadingVoters(true);
        try {
            const response = await api.get(`/posts/${postId}/poll/voters`);
            setVotersData(response.data.voters);
        } catch (error) {
            notifyError(t('poll.error_voters'));
            setIsVotersModalOpen(false);
        } finally {
            setIsLoadingVoters(false);
        }
    };

    const closePoll = async () => {
        setIsLoading(true);
        try {
            await api.post(`/posts/${postId}/poll/close`);
            setIsClosed(true);
            setIsCloseConfirmOpen(false);
        } catch (error) {
            notifyError(error.response?.data?.message || t('error.connection'));
        } finally {
            setIsLoading(false);
        }
    };

    const showResults = votedOptionIds.length > 0 || isClosed;
    const isQuiz = poll.type === 'quiz';
    const optionsToRender = quizData ? quizData.options : poll.options;

    return (
        <div className="socnet-poll">
            <div className="socnet-poll-question">
                {poll.question}
            </div>

            <div className="socnet-poll-options">
                {optionsToRender.map((option) => {
                    const isVoted = votedOptionIds.includes(option.id);
                    const isSelected = draftOptionIds.includes(option.id);
                    const percent = getPercentage(option.id);
                    // голосувати можна якщо не голосував (або можна змінити) І опитування НЕ закрите
                    const canVoteNow = (votedOptionIds.length === 0 || poll.can_change_vote) && !isClosed;

                    let quizClass = '';
                    let icon = null;

                    if (showResults && isQuiz && quizData) {
                        if (option.is_correct) {
                            quizClass = 'quiz-correct';
                            icon = '✅';
                        } else if (isVoted) {
                            quizClass = 'quiz-incorrect';
                            icon = '❌';
                        }
                    }

                    return (
                        <div key={option.id} className="socnet-poll-option-wrapper">
                            <div
                                onClick={() => handleOptionClick(option.id)}
                                className={`socnet-poll-option ${isSelected ? 'is-voted' : ''} ${canVoteNow ? 'can-vote' : 'disabled'} ${quizClass}`}
                            >
                                {showResults && (
                                    <div className="socnet-poll-fill" style={{ width: `${percent}%` }}></div>
                                )}

                                <div className="socnet-poll-text">
                                    {poll.is_multiple_choice && (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            className="socnet-poll-multiple-checkbox"
                                        />
                                    )}
                                    {option.text}
                                    {icon && <span className="socnet-poll-icon">{icon}</span>}
                                </div>

                                {showResults && (
                                    <div
                                        className={`socnet-poll-percent ${!poll.is_anonymous ? 'clickable' : 'default'}`}
                                        onClick={(e) => openVotersModal(option.id, e)}
                                        title={!poll.is_anonymous ? t('poll.view_voters') : ''}
                                    >
                                        {percent}%
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isQuiz && showResults && quizData?.explanation && (
                <div className="socnet-poll-explanation-box">
                    <span className="socnet-poll-explanation-title">{t('poll.explanation_title')}</span>
                    {quizData.explanation}
                </div>
            )}

            {poll.is_multiple_choice && hasDraftChanges && !isClosed && (
                <div className="socnet-poll-actions" style={{ justifyContent: 'flex-start' }}>
                    <button className="socnet-btn" onClick={() => submitVote(draftOptionIds)} disabled={isLoading || draftOptionIds.length === 0}>
                        {t('poll.submit_vote')}
                    </button>
                    {votedOptionIds.length > 0 && (
                        <button className="socnet-btn socnet-btn-cancel" onClick={cancelDraft} disabled={isLoading}>
                            {t('common.cancel')}
                        </button>
                    )}
                </div>
            )}

            <div className="socnet-poll-meta" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{totalVotes} {t('post.votes_count', { count: totalVotes })}</span>
                    {poll.is_anonymous && <><span className="dot">•</span><span>{t('post.anonymous_poll')}</span></>}

                    {isClosed && (
                        <>
                            <span className="dot">•</span>
                            <span className="socnet-poll-closed-badge">{t('poll.closed_badge')}</span>
                        </>
                    )}
                </div>

                {isOwner && !isClosed && (
                    <button className="socnet-poll-close-btn" onClick={() => setIsCloseConfirmOpen(true)}>
                        {t('common.close')}
                    </button>
                )}
            </div>

            {isCloseConfirmOpen && (
                <div className="socnet-modal-overlay" onClick={() => setIsCloseConfirmOpen(false)}>
                    <div className="socnet-modal-dialog" style={{ maxWidth: '350px' }} onClick={e => e.stopPropagation()}>
                        <div className="socnet-modal-text-confirm">
                            {t('poll.close_confirm_text')}
                        </div>
                        <div className="socnet-modal-actions">
                            <button className="socnet-btn-ghost" onClick={() => setIsCloseConfirmOpen(false)}>{t('common.cancel')}</button>
                            <button className="socnet-btn" onClick={closePoll} disabled={isLoading}>{t('common.close')}</button>
                        </div>
                    </div>
                </div>
            )}

            {isVotersModalOpen && !poll.is_anonymous && (
                <div className="socnet-modal-overlay" onClick={() => setIsVotersModalOpen(false)}>
                    <div className="socnet-modal-dialog" onClick={e => e.stopPropagation()}>
                        <button className="socnet-modal-close" onClick={() => setIsVotersModalOpen(false)}>✖</button>
                        <h3 className="socnet-poll-voters-header">{t('poll.voters_title')}</h3>
                        <div className="socnet-tabs">
                            {optionsToRender.map(opt => (
                                <button key={opt.id} className={`socnet-tab ${activeTab === opt.id ? 'active' : ''}`} onClick={() => setActiveTab(opt.id)}>
                                    {opt.text} <span className="socnet-tab-count">{results[opt.id] || 0}</span>
                                </button>
                            ))}
                        </div>
                        <div className="socnet-poll-voters-list-container">
                            {isLoadingVoters ? (
                                <div className="socnet-poll-voters-state-msg">{t('common.loading')}</div>
                            ) : (
                                votersData && votersData[activeTab] && votersData[activeTab].length > 0 ? (
                                    votersData[activeTab].map(vote => (
                                        <Link to={`/${vote.user.username}`} key={vote.user.id} className="socnet-poll-voter-row">
                                            <img src={vote.user.avatar} alt="avatar" className="socnet-poll-voter-img" />
                                            <span className="socnet-poll-voter-name">{vote.user.first_name} {vote.user.last_name}</span>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="socnet-poll-voters-state-msg">{t('poll.no_voters_yet')}</div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}