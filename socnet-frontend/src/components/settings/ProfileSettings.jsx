import { useTranslation } from 'react-i18next';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import UserProfileCard from '../profile/UserProfileCard';

import Input from '../UI/Input';
import DateInput from '../UI/DateInput';
import Button from '../UI/Button';
import Label from '../UI/Label';
import Textarea from '../UI/Textarea';
import FileInput from '../UI/FileInput';

import GenderSelect from './GenderSelect';
import CountrySelect from './CountrySelect';

const ProfileSettings = ({ isSetupMode = false }) => {
    const { t } = useTranslation();

    const {
        formData,
        previewUser,
        canSubmit,
        handleChange,
        handleFileChange,
        handleSubmit,
        avatarFile
    } = useProfileSettings(isSetupMode);

    const renderForm = () => (
        <form
            onSubmit={handleSubmit}
            className={`socnet-settings-form ${isSetupMode ? 'socnet-settings-form-setup' : ''}`}
        >
            <div className="socnet-form-group">
                <Label>{t('common.avatar')}</Label>
                <div className="socnet-avatar-upload-box">
                    <FileInput
                        onFileSelect={handleFileChange}
                        btnText={t('common.browse')}
                    />
                    <span className="socnet-avatar-file-name">
                        {avatarFile ? avatarFile.name : t('common.no_file_selected')}
                    </span>
                </div>
            </div>

            <div className="socnet-form-row">
                <div className="socnet-form-group">
                    <Input
                        label={`${t('common.first_name')} *`}
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        maxLength={50}
                        required
                    />
                </div>
                <div className="socnet-form-group">
                    <Input
                        label={t('common.last_name')}
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        maxLength={50}
                    />
                </div>
            </div>

            <DateInput
                label={`${t('common.birthday')} *`}
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required={isSetupMode}
            />

            <GenderSelect
                value={formData.gender}
                onChange={handleChange}
                required={isSetupMode}
                label={`${t('common.gender')} *`}
            />

            <CountrySelect value={formData.country} onChange={handleChange} />

            <div className="socnet-form-group">
                <Label>{t('settings.about_me')}</Label>
                <Textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength={1000}
                />
            </div>

            <Button
                type="submit"
                variant="save"
                disabled={!canSubmit}
                className={isSetupMode ? 'socnet-btn-full-width' : ''}
            >
                {t(isSetupMode ? 'first_setup.save_and_finish' : 'common.save')}
            </Button>
        </form>
    );

    if (isSetupMode)
        return (
            <div className="socnet-setup-layout">
                <div className="socnet-setup-form-col">
                    {renderForm()}
                </div>
                <div className="socnet-setup-preview-col">
                    <div className="socnet-preview-label">{t('common.preview')}</div>
                    <UserProfileCard currentUser={previewUser} isPreview={true} />
                </div>
            </div>
        );

    return (
        <div className="socnet-settings-regular">
            <UserProfileCard currentUser={previewUser} isPreview={true} />
            {renderForm()}
        </div>
    );
};

export default ProfileSettings;