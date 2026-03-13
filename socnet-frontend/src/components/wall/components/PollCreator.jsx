import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../..//UI/Button';
import Input from '../..//UI/Input';
import Textarea from '../../UI/Textarea';
import { notifyError } from '../..//common/Notify';

export default function PollCreator({ initialData, onSave, onCancel }) {
    const { t } = useTranslation();

    const [question, setQuestion] = useState(initialData?.question || '');
    const [options, setOptions] = useState(initialData?.options || [
        { id: 1, text: '', is_correct: false },
        { id: 2, text: '', is_correct: false }
    ]);

    const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous || false);
    const [isMultipleChoice, setIsMultipleChoice] = useState(initialData?.is_multiple_choice || false);
    const [canChangeVote, setCanChangeVote] = useState(initialData?.can_change_vote || false);
    const [isQuiz, setIsQuiz] = useState(initialData?.type === 'quiz' || false);
    const [explanation, setExplanation] = useState(initialData?.explanation || '');

    const handleAddOption = () => {
        if (options.length >= 16) {
            notifyError(t('poll.max_options_reached'));
            return;
        }
        setOptions([...options, { id: Date.now(), text: '', is_correct: false }]);
    };

    const handleRemoveOption = (id) => {
        if (options.length <= 2) {
            notifyError(t('poll.min_options_reached'));
            return;
        }
        setOptions(options.filter(opt => opt.id !== id));
    };

    const handleOptionChange = (id, text) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    };

    const handleSetCorrect = (id) => {
        if (isMultipleChoice) {
            setOptions(options.map(opt => opt.id === id ? { ...opt, is_correct: !opt.is_correct } : opt));
        } else {
            setOptions(options.map(opt => ({ ...opt, is_correct: opt.id === id })));
        }
    };

    const handleSave = () => {
        if (!question.trim()) return notifyError(t('poll.empty_question'));
        if (options.some(opt => !opt.text.trim())) return notifyError(t('poll.empty_option'));
        if (isQuiz && !options.some(opt => opt.is_correct)) return notifyError(t('poll.no_correct_option'));
        if (isQuiz && explanation.length > 255) return notifyError(t('poll.explanation_too_long'));

        const pollData = {
            question: question.trim(),
            type: isQuiz ? 'quiz' : 'regular',
            is_anonymous: isAnonymous,
            is_multiple_choice: isMultipleChoice,
            can_change_vote: canChangeVote,
            explanation: isQuiz && explanation.trim() ? explanation.trim() : null,
            options: options.map((opt, index) => ({
                id: index + 1,
                text: opt.text.trim(),
                ...(isQuiz && { is_correct: opt.is_correct })
            }))
        };

        onSave(pollData);
    };

    return (
        <div className="socnet-poll-creator">
            <h3>{t('poll.create_title')}</h3>

            <Input
                placeholder={t('poll.question_placeholder')}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={255}
            />

            <div className="socnet-poll-options-list">
                {options.map((option, index) => (
                    <div key={option.id} className="socnet-poll-option-row">
                        {isQuiz && (
                            <input
                                type={isMultipleChoice ? "checkbox" : "radio"}
                                checked={option.is_correct}
                                onChange={() => handleSetCorrect(option.id)}
                                title={t('poll.mark_correct')}
                                className="socnet-poll-checkbox"
                            />
                        )}
                        <Input
                            placeholder={`${t('poll.option')} ${index + 1}`}
                            value={option.text}
                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                            maxLength={100}
                        />
                        <Button type="button" onClick={() => handleRemoveOption(option.id)} variant="danger" className="socnet-poll-remove-btn">
                            ✖
                        </Button>
                    </div>
                ))}
            </div>

            {options.length < 16 && (
                <Button type="button" onClick={handleAddOption} className="socnet-btn-ghost socnet-poll-add-btn">
                    + {t('poll.add_option')}
                </Button>
            )}

            <div className="socnet-poll-settings">
                <label className="socnet-poll-setting-label">
                    <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="socnet-poll-checkbox" />
                    {t('poll.setting_anonymous')}
                </label>

                <label className="socnet-poll-setting-label">
                    <input type="checkbox" checked={isMultipleChoice} onChange={(e) => {
                        setIsMultipleChoice(e.target.checked);
                        if (!e.target.checked && isQuiz) {
                            setOptions(options.map(opt => ({ ...opt, is_correct: false })));
                        }
                    }} className="socnet-poll-checkbox" />
                    {t('poll.setting_multiple')}
                </label>

                <label className="socnet-poll-setting-label">
                    <input type="checkbox" checked={canChangeVote} onChange={(e) => setCanChangeVote(e.target.checked)} className="socnet-poll-checkbox" />
                    {t('poll.setting_revote')}
                </label>

                <label className="socnet-poll-setting-label highlight">
                    <input type="checkbox" checked={isQuiz} onChange={(e) => setIsQuiz(e.target.checked)} className="socnet-poll-checkbox" />
                    <span>{t('poll.setting_quiz')}</span>
                </label>
            </div>

            {isQuiz && (
                <div className="socnet-poll-explanation-wrapper">
                    <Textarea
                        placeholder={t('poll.explanation_placeholder')}
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        maxLength={255}
                        className="socnet-form-textarea fixed-size"
                    />
                </div>
            )}

            <div className="socnet-poll-actions">
                <Button type="button" onClick={onCancel} className="socnet-btn-cancel">{t('common.cancel')}</Button>
                <Button type="button" onClick={handleSave}>{t('common.save')}</Button>
            </div>
        </div>
    );
}