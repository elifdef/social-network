import { notifyWarn } from "../common/Notify";

const DangerZone = ({ t }) => {
    return (
        <div className="socnet-settings-danger">
            <div className="socnet-settings-danger-header">{t('settings.danger_zone')}</div>
            <div className="socnet-settings-danger-body">
                <div>
                    <h4>{t('settings.delete_account')}</h4>
                    <div className="socnet-settings-quote">{t('settings.quote')}</div>
                    <p className="socnet-settings-desc">{t('settings.delete_warning')}</p>
                </div>
                <button className="socnet-btn-delete" onClick={() => notifyWarn('under construction')}>
                    {t('settings.delete_account')}
                </button>
            </div>
        </div>
    );
};

export default DangerZone;