import toast from 'react-hot-toast';
import InfoIcon from '../assets/info.svg?react';
import SuccessIcon from '../assets/success.svg?react';
import ErrorIcon from '../assets/error.svg?react';
import WarningIcon from '../assets/warning.svg?react';
import LoadingIcon from '../assets/loader.svg?react';
import i18n from "../i18n";

const toastStyles = {
    fontFamily: 'Tahoma, sans-serif',
    fontSize: '12px',
    color: '#FFFFFF',
    background: '#2b2b2b',
    border: '1px solid #C0CAD5',
    borderRadius: '2px',
    padding: '10px 15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const renderToast = (message, IconComponent) => {
    return toast((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {IconComponent}
            <span>{message}</span>
        </div>
    ), {
        style: toastStyles,
        duration: 5000,
        position: 'bottom-right'
    });
};

export const notifyInfo = (message) => {
    return renderToast(message, <InfoIcon width={20} height={20} fill="#71aaeb" />);
};

export const notifySuccess = (message) => {
    return renderToast(message, <SuccessIcon width={20} height={20} fill="#4bb34b" />);
};

export const notifyError = (message) => {
    return renderToast(message, <ErrorIcon width={20} height={20} fill="#ff3347" />);
};

export const notifyWarn = (message) => {
    return renderToast(message, <WarningIcon width={20} height={20} fill="#f5c400" />);
};

export const notifyConfirmAction = (message, btnYes = i18n.t('common.yes'), btnNo = i18n.t('common.no')) => {
    return new Promise((resolve) => {
        toast((t) => (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                width: '100%',
                justifyContent: 'space-between',
            }}>
                <span style={{ flex: 1 }}>{message}</span>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => { toast.dismiss(t.id); resolve(true); }}
                        style={{
                            padding: '4px 12px',
                            background: '#45688E',
                            border: '1px solid #45688E',
                            borderRadius: '2px',
                            color: 'white',
                            cursor: 'pointer',
                            fontFamily: 'Tahoma, sans-serif',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}
                    >
                        {btnYes}
                    </button>

                    <button
                        onClick={() => { toast.dismiss(t.id); resolve(false); }}
                        style={{
                            padding: '4px 12px',
                            background: '#F5F7FA',
                            border: '1px solid #C0CAD5',
                            borderRadius: '2px',
                            color: '#45688E',
                            cursor: 'pointer',
                            fontFamily: 'Tahoma, sans-serif',
                            fontSize: '11px'
                        }}
                    >
                        {btnNo}
                    </button>
                </div>
            </div>
        ), {
            duration: 10000,
            position: 'right',
            style: {
                ...toastStyles,
                minWidth: '300px',
                border: '1px solid #45688E'
            },
        });
    });
};

export const notifyLoading = (message = "Обробка...") => {
    return toast((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LoadingIcon width={20} height={20} fill="#fff" className="vk-spin" />
            <span>{message}</span>
        </div>
    ), {
        style: toastStyles,
        duration: Infinity,
        position: 'bottom-right'
    });
};

export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};