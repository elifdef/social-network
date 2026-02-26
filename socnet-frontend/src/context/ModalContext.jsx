import { createContext, useState, useContext, useCallback } from 'react';
import ActionModal from '../components/common/ActionModal';
import i18n from '../i18n';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null,
        message: '',
        defaultText: '',
        btnSubmit: '',
        btnCancel: '',
        resolve: null,
    });

    const openConfirm = useCallback((message, btnYes = i18n.t('common.yes'), btnNo = i18n.t('common.no')) => {
        return new Promise((resolve) => {
            setModalState({ isOpen: true, type: 'confirm', message, btnSubmit: btnYes, btnCancel: btnNo, resolve });
        });
    }, []);

    const openPrompt = useCallback((message, defaultText = '', btnSubmit = i18n.t('common.yes'), btnCancel = i18n.t('common.no')) => {
        return new Promise((resolve) => {
            setModalState({ isOpen: true, type: 'prompt', message, defaultText, btnSubmit, btnCancel, resolve });
        });
    }, []);

    const handleClose = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ModalContext.Provider value={{ openConfirm, openPrompt }}>
            {children}

            <ActionModal
                isOpen={modalState.isOpen}
                onClose={handleClose}
                type={modalState.type}
                message={modalState.message}
                defaultText={modalState.defaultText}
                btnSubmit={modalState.btnSubmit}
                btnCancel={modalState.btnCancel}
                onResolve={modalState.resolve}
            />
        </ModalContext.Provider>
    );
};