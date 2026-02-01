import toast from 'react-hot-toast';
import { InfoIcon, SuccessIcon, ErrorIcon, WarningIcon, LoadingIcon } from './Icons/Icons';

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
        duration: 3000,
        position: 'bottom-right'
    });
};

export const notifyInfo = (message) => {
    return renderToast(message, <InfoIcon />);
};

export const notifySuccess = (message) => {
    return renderToast(message, <SuccessIcon />);
};

export const notifyError = (message) => {
    return renderToast(message, <ErrorIcon />);
};

export const notifyWarn = (message) => {
    return renderToast(message, <WarningIcon />);
};

export const notifyConfirmAction = (message, btnYes = "Так", btnNo = "Ні") => {
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
                        onMouseOver={(e) => e.currentTarget.style.background = '#537599'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#45688E'}
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
                        onMouseOver={(e) => e.currentTarget.style.background = '#E5EBF1'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#F5F7FA'}
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
            {LoadingIcon}
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