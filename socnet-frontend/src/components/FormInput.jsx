const FormInput = ({ id, ...props }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <input
                id={id}
                className="input-field"
                {...props}
            />
        </div>
    );
};

export default FormInput;