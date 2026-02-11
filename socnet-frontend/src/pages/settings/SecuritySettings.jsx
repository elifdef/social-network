import { useSecuritySettings } from '../../hooks/useSecuritySettings';
import FormInput from '../../components/UI/FormInput';
import { notifyWarn } from "../../components/Notify";

const SecuritySettings = () => {
    const {
        user,
        email, setEmail,
        passwordForEmail, setPasswordForEmail,
        loadingEmail, handleUpdateEmail,
        currentPassword, setCurrentPassword,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        loadingPass, handleUpdatePassword, t
    } = useSecuritySettings();

    return (
        <>
            <div className="vk-settings-box">
                <strong>{t('settings.change_email')}</strong>
                <div className="vk-settings-info-row">
                    <div className="vk-settings-info-item">
                        <span>{t('settings.current_email')}:</span>
                        <span>{user?.email}</span>
                    </div>

                    <div className="vk-settings-info-item">
                        <span>{t('settings.verification_status')}:</span>
                        <span style={{ color: user?.email_verified_at ? '#10b981' : '#f59e0b' }}>
                            {t('common.' + (
                                (user?.email_verified_at) ? 'confirmed' : 'unconfirmed')
                            )}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleUpdateEmail} className="vk-settings-form">
                    <div className="vk-form-group">
                        <label className="vk-form-label">{t('settings.new_email')}</label>
                        <FormInput
                            type="email"
                            className="vk-form-input"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="NewEmail@example.com"
                        />
                    </div>

                    <div className="vk-form-group">
                        <label className="vk-form-label">{t('settings.account_password')}</label>
                        <FormInput
                            type="password"
                            className="vk-form-input"
                            required
                            value={passwordForEmail}
                            onChange={(e) => setPasswordForEmail(e.target.value)}
                            placeholder="********"
                        />
                    </div>
                    <button
                        className="vk-btn-save"
                        type="submit"
                        disabled={loadingEmail}
                    >
                        {loadingEmail ? t('common.saving') : t('common.change')}
                    </button>
                </form>
            </div>

            <div className="vk-settings-box">
                <strong>{t('settings.change_password')}</strong>
                <form onSubmit={handleUpdatePassword}>
                    <div className="vk-form-group">
                        <label className="vk-form-label">{t('settings.current_password')}</label>
                        <FormInput
                            type="password"
                            className="vk-form-input"
                            required
                            placeholder="********"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="vk-form-group">
                        <label className="vk-form-label">{t('settings.new_password')}</label>
                        <FormInput
                            type="password"
                            className="vk-form-input"
                            required
                            placeholder="********"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="vk-form-group">
                        <label className="vk-form-label">{t('auth.password_confirmation')}</label>
                        <FormInput
                            type="password"
                            className="vk-form-input"
                            required
                            placeholder="********"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="vk-btn-save"
                        disabled={loadingPass}
                    >
                        {loadingPass ? t('common.saving') : t('common.save')}
                    </button>
                </form>
            </div>

            <div className="vk-settings-danger">
                <div className="vk-settings-danger-header">{t('settings.danger_zone')}</div>
                <div className="vk-settings-danger-body">
                    <div>
                        <h4>{t('settings.delete_account')}</h4>
                        <div className="vk-settings-quote">{t('settings.quote')}</div>
                        <p className="vk-settings-desc">{t('settings.delete_warning')}</p>
                    </div>
                    <button className="vk-btn-delete" onClick={() => notifyWarn('Ben say NO')}>
                        {t('settings.delete_account')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default SecuritySettings;