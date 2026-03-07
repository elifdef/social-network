import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const FileInput = ({
    onFileSelect,
    accept = "image/*",
    btnText,
    className = "",
    ...props
}) => {
    const { t } = useTranslation();
    const inputRef = useRef(null);

    const handleClick = () => {
        inputRef.current.click();
    };

    return (
        <div className={`socnet-file-input-wrapper ${className}`}>
            <input
                type="file"
                ref={inputRef}
                onChange={onFileSelect}
                accept={accept}
                className="socnet-hidden-input"
                {...props}
            />

            <button
                type="button"
                className="socnet-btn socnet-btn-auto-width"
                onClick={handleClick}
            >
                {btnText || t('common.upload')}
            </button>
        </div>
    );
};

export default FileInput;