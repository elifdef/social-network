import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { reportAPI } from '../../api/reports.api';
import { notifySuccess, notifyError } from '../common/Notify';

export default function ReportModal({ isOpen, onClose, targetType, targetId }) {
    const { t } = useTranslation();
    const [reasons, setReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingReasons, setIsLoadingReasons] = useState(false);

    useEffect(() => {
        if (isOpen && reasons.length === 0) {
            const fetchReasons = async () => {
                setIsLoadingReasons(true);
                try {
                    const data = await reportAPI.getReasons();
                    setReasons(data);
                    if (data.length > 0) setSelectedReason(data[0]);
                } catch (error) {
                    notifyError(t('reports.error_load_reasons'));
                } finally {
                    setIsLoadingReasons(false);
                }
            };
            fetchReasons();
        }
    }, [isOpen, reasons.length, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedReason) {
            notifyError(t('reports.choose_reason'));
            return;
        }

        if (!targetId) {
            notifyError(t('common.error'));
            return;
        }

        setIsSubmitting(true);
        try {
            await reportAPI.submitReport({
                type: targetType,
                id: targetId,
                reason: selectedReason,
                details: details
            });

            notifySuccess(t('reports.success'));
            handleClose();
        } catch (error) {
            notifyError(error.response?.data?.message || t('common.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setDetails('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="socnet-modal-overlay" onClick={handleClose}>
            <div className="socnet-modal-dialog" onClick={e => e.stopPropagation()}>

                <h2 className="socnet-section-title report-modal-title">
                    {t('reports.title')}
                </h2>

                <form onSubmit={handleSubmit}>
                    {isLoadingReasons ? (
                        <div className="socnet-empty-state">{t('common.loading')}</div>
                    ) : (
                        <>
                            <div className="socnet-form-group">
                                <label className="socnet-form-label">{t('reports.reason_label')}</label>
                                <select
                                    className="socnet-form-select"
                                    value={selectedReason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    required
                                >
                                    {reasons.map(r => (
                                        <option key={r} value={r}>
                                            {t(`reports.reasons.${r}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="socnet-form-group">
                                <label className="socnet-form-label">{t('reports.details_label')}</label>
                                <textarea
                                    className="socnet-form-textarea"
                                    placeholder={t('reports.details_placeholder')}
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    rows="4"
                                    maxLength="1000"
                                />
                            </div>
                        </>
                    )}

                    <div className="socnet-modal-actions report-modal-actions">
                        <button
                            type="button"
                            className="socnet-btn socnet-btn-cancel"
                            onClick={handleClose}
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="socnet-btn"
                            disabled={isSubmitting || isLoadingReasons}
                        >
                            {isSubmitting ? t('common.saving') : t('reports.submit_btn')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}