const Button = ({
  children,
  color,
  size,
  onClick,
  variant,
  type = "button",
  className = "",
  disabled = false,
  ...buttonProps
}) => {
  const colors = {
    white: "text-white",
    golden: "bg-golden text-white hover:bg-goldenHover",
    darkgray: "border border-white/20 bg-darkGray text-white",
    black: "bg-black text-white hover:bg-golden",
  };
  const sizes = {
    sm: "px-2 py-1.5 text-sm",
    md: "px-4 py-3",
  };
  const variants = {
    simple: "",
    normal: "px-5 py-3 font-medium",
  };

  return (
    <button
      className={`w-fit items-center rounded-xl text-center font-medium transition-colors ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${variants[variant] || ""} ${colors[color] || ""} ${
        sizes[size] || ""
      } ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
};

export default Button;
