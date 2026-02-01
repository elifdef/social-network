const defaultProps = {
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
    fill: "none",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
};

export const InfoIcon = ({ color = "#45688E" }) => (
    <svg {...defaultProps} stroke={color}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

export const SuccessIcon = ({ color = "#4BB34B" }) => (
    <svg {...defaultProps} stroke={color}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export const ErrorIcon = ({ color = "#E64646" }) => (
    <svg {...defaultProps} stroke={color}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
);

export const WarningIcon = ({ color = "#E59500" }) => (
    <svg {...defaultProps} stroke={color}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

export const LoadingIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#45688E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </svg>
);