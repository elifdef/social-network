import toast from 'react-hot-toast';
import InfoIcon from '../../assets/info.svg?react';
import SuccessIcon from '../../assets/success.svg?react';
import ErrorIcon from '../../assets/error.svg?react';
import WarningIcon from '../../assets/warning.svg?react';
import LoadingIcon from '../../assets/loader.svg?react';

const toastStyles = {
    fontSize: '12px',
    color: '#FFFFFF',
    background: '#2b2b2b',
    border: '1px solid #C0CAD5',
    padding: '10px 15px'
};

const renderToast = (message, IconComponent) => {
    toast.dismiss();
    return toast((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {IconComponent}
            <span>{message}</span>
        </div>
    ), {
        style: toastStyles,
        duration: 4000,
        position: 'bottom-right'
    });
};

export const notifyInfo = (message) => renderToast(message, <InfoIcon width={20} height={20} fill="#71aaeb" />);
export const notifySuccess = (message) => renderToast(message, <SuccessIcon width={20} height={20} fill="#4bb34b" />);
export const notifyError = (message) => renderToast(message, <ErrorIcon width={20} height={20} fill="#ff3347" />);
export const notifyWarn = (message) => renderToast(message, <WarningIcon width={20} height={20} fill="#f5c400" />);

export const notifyLoading = (message = "Обробка...") => {
    toast.dismiss();
    return toast((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LoadingIcon width={20} height={20} fill="#fff" className="socnet-spin" />
            <span>{message}</span>
        </div>
    ), {
        style: toastStyles,
        duration: Infinity,
        position: 'bottom-right'
    });
};

export const dismissToast = () => {
    toast.dismiss();
};