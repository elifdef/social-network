import toast from 'react-hot-toast';
import i18next from 'i18next';
import InfoIcon from '../../assets/info.svg?react';
import SuccessIcon from '../../assets/success.svg?react';
import ErrorIcon from '../../assets/error.svg?react';
import WarningIcon from '../../assets/warning.svg?react';
import LoadingIcon from '../../assets/loader.svg?react';

const renderToast = (message, IconComponent) => {
    toast.dismiss();
    return toast((t) => (
        <div className="socnet-toast-inner">
            {IconComponent}
            <span>{message}</span>
        </div>
    ), {
        className: 'socnet-toast-wrapper',
        duration: 4000,
        position: 'bottom-right'
    });
};

export const notifyInfo = (message) => renderToast(message, <InfoIcon width={20} height={20} fill="#71aaeb" />);
export const notifySuccess = (message) => renderToast(message, <SuccessIcon width={20} height={20} fill="#4bb34b" />);
export const notifyError = (message) => renderToast(message, <ErrorIcon width={20} height={20} fill="#ff3347" />);
export const notifyWarn = (message) => renderToast(message, <WarningIcon width={20} height={20} fill="#f5c400" />);

export const notifyLoading = (message) => {
    toast.dismiss();
    const text = message || i18next.t('common.processing');

    return toast((t) => (
        <div className="socnet-toast-inner">
            <LoadingIcon width={20} height={20} fill="#fff" className="socnet-spin" />
            <span>{text}</span>
        </div>
    ), {
        className: 'socnet-toast-wrapper',
        duration: Infinity,
        position: 'bottom-right'
    });
};

export const dismissToast = () => {
    toast.dismiss();
};