import toast from "react-hot-toast";
import { useSecuritySettings } from '../../hooks/useSecuritySettings';
import FormInput from '../../components/FormInput';

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
                <strong style={{ fontSize: '16px', display: 'block', marginBottom: '20px' }}>
                    Зміна електронної пошти
                </strong>
                <div style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Поточна електронна адреса:</span>
                        <span>{user?.email}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Статус верифікації:</span>
                        <span style={{
                            fontWeight: '600',
                            color: user?.email_verified_at ? '#10b981' : '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            {user?.email_verified_at ? (<>✅ Підтверджено</>) : (<>⚠️ Не підтверджено</>)}
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

                    <div style={{ textAlign: 'right' }}>
                        <button
                            className="btn-save"
                            type="submit"
                            disabled={loadingEmail}
                        >
                            {loadingEmail ? 'Зберігаємо...' : 'Змінити'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="info-box">
                <strong style={{ fontSize: '16px', display: 'block', marginBottom: '15px' }}>
                    Зміна паролю
                </strong>

                <form onSubmit={handleUpdatePassword}>
                    <div>
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

                    <div>
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

                    <div>
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

                    <div style={{ textAlign: 'right' }}>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={loadingPass}
                        >
                            {loadingPass ? 'Зберігаємо...' : 'Змінити пароль'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="danger-zone" style={{ marginTop: '30px' }}>
                <div className="danger-header">Небезпечна зона</div>
                <div className="danger-body">
                    <div>
                        <h4 style={{ margin: '0 0 5px' }}>Видалити акаунт</h4>
                        <div style={{ color: '#666', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.5' }}>
                            - Ти це зробиш?<br />
                            - Так.<br />
                            - І якою ціною?<br />
                            - Ціною всього.
                        </div>
                    </div>
                    <button className="btn-delete" onClick={() => toast('Не сьогодні')}>
                        Видалити акаунт
                    </button>
                </div>
            </div>
        </>
    );
};

export default SecuritySettings;