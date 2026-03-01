import { useEffect, useState } from "react";

export default function ActionModal({
    isOpen,
    onClose,
    type,
    placeholder,
    message,
    defaultText = '',
    btnSubmit,
    btnCancel,
    onResolve
}) {
    const [inputValue, setInputValue] = useState(defaultText);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onResolve(type === 'prompt' ? null : false);
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onResolve, type]);

    useEffect(() => {
        if (isOpen) setInputValue(defaultText);
    }, [isOpen, defaultText]);

    if (!isOpen) return null;

    return (
        <div className="socnet-modal-overlay" onClick={() => {
            onResolve(type === 'prompt' ? null : false);
            onClose();
        }}>
            <div
                className="socnet-modal-content"
                style={{ maxWidth: '400px', minHeight: 'auto', padding: '20px', margin: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ fontWeight: 'bold', marginBottom: '15px', color: 'var(--theme-text-main)', fontSize: '14px' }}>
                    {message}
                </div>

                {type === 'prompt' && (
                    <input
                        autoFocus
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="socnet-form-input"
                        style={{ marginBottom: '15px' }}
                        placeholder={placeholder}
                    />
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        className="socnet-btn"
                        style={{ minWidth: '80px' }}
                        onClick={() => {
                            onResolve(type === 'prompt' ? inputValue : true);
                            onClose();
                        }}
                        disabled={!inputValue.trim()}
                    >
                        {btnSubmit}
                    </button>
                    <button
                        className="socnet-btn"
                        style={{ minWidth: '80px', background: 'transparent', color: 'var(--theme-link)', borderColor: 'var(--theme-border)' }}
                        onClick={() => {
                            onResolve(type === 'prompt' ? null : false);
                            onClose();
                        }}
                    >
                        {btnCancel}
                    </button>
                </div>
            </div>
        </div>
    );
}