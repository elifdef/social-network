const FormInput = ({ id, ...props }) => {
    return (
        <input
            id={id}
            className="input-field"
            {...props}
        />
    );
};

export default FormInput;