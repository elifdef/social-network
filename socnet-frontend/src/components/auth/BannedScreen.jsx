import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import Button from '../UI/Button';
import api from '../../api/axios';
import { notifySuccess, notifyError } from '../common/Notify';

export const BannedScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const { t } = useTranslation();

    const [isAppealing, setIsAppealing] = useState(false);
    const [appealText, setAppealText] = useState('');
    const [hasPendingAppeal, setHasPendingAppeal] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;

        const checkStatus = async () => {
            try {
                const res = await api.get('/appeals/status');
                setHasPendingAppeal(res.data.has_pending_appeal);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingStatus(false);
            }
        };

        checkStatus();
    }, [user]);

    const handleAppealSubmit = async () => {
        if (!appealText.trim()) return;
        setIsSubmitting(true);

        try {
            await api.post('/appeals', { message: appealText });
            notifySuccess(t('banned.appeal_success'));
            setHasPendingAppeal(true);
            setIsAppealing(false);
        } catch (error) {
            notifyError(error.response?.data?.message || t('banned.appeal_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="socnet-fullscreen-center">
            <div className="socnet-card-wrapper banned-card">
                <h1 className="banned-title">{t('banned.title')}</h1>

                <p className="banned-message">
                    {t('banned.message', {
                        name: user.first_name,
                        username: user.username
                    })}
                </p>

                <div className="banned-reason-box">
                    <h4 className="banned-reason-label">{t('banned.reason_label')}</h4>
                    <p className="banned-reason-text">
                        {user.ban_reason || t('banned.reason_not_specified')}
                    </p>
                </div>

                {isLoadingStatus ? (
                    <div className="socnet-empty-state">{t('common.loading')}</div>
                ) : (
                    <>
                        {hasPendingAppeal ? (
                            <div className="socnet-info-block banned-appeal-pending-box">
                                <span className="socnet-value banned-appeal-pending-text">
                                    {t('banned.appeal_pending')}
                                </span>
                            </div>
                        ) : (
                            <div className="banned-actions banned-actions-vertical">

                                {isAppealing ? (
                                    <div className="banned-appeal-form">
                                        <h4 className="banned-reason-label banned-appeal-form-title">
                                            {t('banned.appeal_form_title')}
                                        </h4>
                                        <textarea
                                            className="socnet-form-textarea"
                                            rows="4"
                                            value={appealText}
                                            onChange={(e) => setAppealText(e.target.value)}
                                            placeholder={t('banned.appeal_placeholder')}
                                            disabled={isSubmitting}
                                        />
                                        <div className="banned-appeal-buttons">
                                            <Button
                                                onClick={handleAppealSubmit}
                                                disabled={isSubmitting || !appealText.trim()}
                                                className="banned-btn-flex"
                                            >
                                                {isSubmitting ? t('common.saving') : t('banned.appeal_submit')}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setIsAppealing(false)}
                                                disabled={isSubmitting}
                                            >
                                                {t('common.cancel')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="banned-default-buttons">
                                        <Button onClick={() => setIsAppealing(true)} className="banned-btn-appeal banned-btn-flex">
                                            {t('banned.appeal_btn')}
                                        </Button>
                                        <Button onClick={logout} className="admin-btn-danger">
                                            {t('auth.signout')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};