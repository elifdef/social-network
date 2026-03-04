import { notifyError, notifyWarn } from "../components/common/Notify";
import { MAX_FILE_SIZE_KB } from "../config";
import i18n from "../i18n";

const checkFileSize = (file) => {
    const maxBytes = MAX_FILE_SIZE_KB * 1024;
    if (file.size > maxBytes) {
        notifyWarn(i18n.t('error.large_file', { size: MAX_FILE_SIZE_KB / 1024 }));
        return false;
    }
    return true;
};

const checkFileImage = (file) => {
    if (!file.type.startsWith('image/')) {
        notifyError(i18n.t('error.not_image'));
        return false;
    }
    return true;
};

export const validateImageFile = (file) => {
    if (!checkFileImage(file)) return false;
    if (!checkFileSize(file)) return false;
    return true;
}