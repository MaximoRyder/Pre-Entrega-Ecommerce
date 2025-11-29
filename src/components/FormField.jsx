const FormField = ({ label, htmlFor, error, children, className = "" }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium text-sub uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      {children}
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  );
};

export default FormField;
