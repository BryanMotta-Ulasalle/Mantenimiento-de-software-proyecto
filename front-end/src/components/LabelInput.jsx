import { useId } from "react";

const LabelInput = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  isProfile = false,
  className = "",
  ...inputProps
}) => {
  const generatedId = useId();
  const inputId = id || name || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-xl border px-4 py-3 focus:border-2 focus:border-goldenHover focus:outline-none ${
          isProfile
            ? "border-gray-300 bg-gray-100"
            : "border-gray-200 bg-white"
        } ${error ? "border-red-400" : ""} ${className}`}
        {...inputProps}
      />
      {error && (
        <span id={errorId} className="text-sm text-red-600">
          {error}
        </span>
      )}
    </div>
  );
};

export default LabelInput;
