import { notifyError, notifyWarn } from "../components/common/Notify";
import { MAX_FILE_SIZE_KB } from "../config";
import i18n from "../i18n";

export const checkFileSize = (file) => {
    const maxBytes = MAX_FILE_SIZE_KB * 1024;
    if (file.size > maxBytes) {
        notifyWarn(i18n.t('error.large_file', { size: MAX_FILE_SIZE_KB / 1024 }));
        return false;
    }
    return true;
};

export const validateImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
        notifyError(i18n.t('error.not_image'));
        return false;
    }
    return checkFileSize(file);
};

export const validateGenericFile = (file) => {
    const forbiddenExtensions = ['.exe', '.bat', '.sh', '.js'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (forbiddenExtensions.includes(ext)) {
        notifyError(i18n.t('error.forbidden_file_type'));
        return false;
    }

    return checkFileSize(file);
};

export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};