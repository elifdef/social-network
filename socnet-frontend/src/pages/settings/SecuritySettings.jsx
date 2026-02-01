import { useSecuritySettings } from '../../hooks/useSecuritySettings';
import FormInput from '../../components/FormInput';
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
        loadingPass, handleUpdatePassword
    } = useSecuritySettings();

    return (
        <>
            <div className="info-box">
                <strong>Зміна електронної пошти</strong>
                <div className="info-box-block">
                    <div className="info-box-block-email">
                        <span>Поточна електронна адреса:</span>
                        <span>{user?.email}</span>
                    </div>

                    <div className="info-box-block-email-verif">
                        <span>Статус верифікації:</span>
                        <span style={{ color: user?.email_verified_at ? '#10b981' : '#f59e0b' }}>
                            {user?.email_verified_at ? "Підтверджено" : "Непідтверджено"}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleUpdateEmail} className="settings-form">
                    <div className="form-group">
                        <label className="form-label">Нова електронна адреса</label>
                        <FormInput
                            type="email"
                            className="form-input"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="new-email@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Пароль акаунту</label>
                        <FormInput
                            type="password"
                            className="form-input"
                            required
                            value={passwordForEmail}
                            onChange={(e) => setPasswordForEmail(e.target.value)}
                            placeholder="********"
                        />
                    </div>
                    <button
                        className="btn-save"
                        type="submit"
                        disabled={loadingEmail}
                    >
                        {loadingEmail ? 'Зберігаємо...' : 'Змінити'}
                    </button>
                </form>
            </div>

            <div className="info-box">
                <strong>Зміна паролю</strong>
                <form onSubmit={handleUpdatePassword}>
                    <div className="form-group">
                        <label className="form-label">Поточний пароль</label>
                        <FormInput
                            type="password"
                            className="form-input"
                            required
                            placeholder="********"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Новий пароль (не менше 8 символів)</label>
                        <FormInput
                            type="password"
                            className="form-input"
                            required
                            placeholder="********"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Підтвердіть новий пароль</label>
                        <FormInput
                            type="password"
                            className="form-input"
                            required
                            placeholder="********"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-save"
                        disabled={loadingPass}
                    >
                        {loadingPass ? 'Зберігаємо...' : 'Змінити пароль'}
                    </button>
                </form>
            </div>

            <div className="danger-zone">
                <div className="danger-header">Небезпечна зона</div>
                <div className="danger-body">
                    <div>
                    <h4>Видалити акаунт</h4>
                    <div className="danger-body-quote">
                        - Ти це зробиш?<br />
                        - Так.<br />
                        - І якою ціною?<br />
                        - Ціною всього.
                    </div>
                    </div>
                    <button className="btn-delete" onClick={() => notifyWarn('Не сьогодні')}>
                        Видалити акаунт
                    </button>
                </div>
            </div>
        </>
    );
};

export default SecuritySettings;