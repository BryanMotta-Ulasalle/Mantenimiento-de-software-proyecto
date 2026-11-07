import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

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
  const isPassword = type === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const input = (
    <input
      id={inputId}
      name={name}
      type={isPassword && isPasswordVisible ? "text" : type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? errorId : undefined}
      autoCapitalize={isPassword ? "none" : undefined}
      spellCheck={isPassword ? false : undefined}
      className={`rounded-xl border px-4 py-3 focus:border-2 focus:border-goldenHover focus:outline-none ${
        isProfile
          ? "border-gray-300 bg-gray-100"
          : "border-gray-200 bg-white"
      } ${error ? "border-red-400" : ""} ${isPassword ? "w-full pr-12 [&::-ms-reveal]:hidden" : ""} ${className}`}
      {...inputProps}
    />
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="font-medium">
          {label}
        </label>
      )}
      {isPassword ? (
        <div className="relative">
          {input}
          <button
            type="button"
            aria-controls={inputId}
            aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            disabled={inputProps.disabled}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            className="absolute inset-y-1 right-1 grid w-10 place-items-center rounded-lg text-stone-600 enabled:cursor-pointer enabled:hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-golden disabled:opacity-50"
          >
            {isPasswordVisible ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      ) : input}
      {error && (
        <span id={errorId} className="text-sm text-red-600">
          {error}
        </span>
      )}
    </div>
  );
};

export default LabelInput;
