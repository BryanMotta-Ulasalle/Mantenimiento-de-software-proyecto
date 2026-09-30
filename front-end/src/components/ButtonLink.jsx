import { Link } from "react-router-dom";

const ButtonLink = ({
  children,
  to,
  size,
  color,
  className = "",
}) => {
  const sizes = {
    md: "px-4 py-2",
  };
  const colors = {
    golden: "bg-golden text-white hover:bg-goldenHover",
    black: "font-bold hover:text-goldenHover",
    gray: "text-pGray hover:text-black",
    bgBlack: "bg-black text-white font-medium hover:bg-goldenHover",
  };

  return (
    <Link
      to={to}
      className={`w-fit cursor-pointer items-center rounded-xl text-center ${
        sizes[size] || ""
      } ${colors[color] || ""} ${className}`}
    >
      {children}
    </Link>
  );
};

export default ButtonLink;
