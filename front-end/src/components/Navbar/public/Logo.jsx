import { Link } from "react-router-dom";

const Logo = ({ isHome }) => {
  return (
    <Link
      to="/"
      className="flex items-center justify-center gap-3 rounded-lg"
      aria-label="Ir al inicio"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-2xl font-black ${
          isHome ? "bg-orange-300 text-stone-900" : "bg-black text-white"
        }`}
      >
        S
      </span>
      <span
        className={`hidden font-semibold lg:inline-block ${
          isHome ? "text-white" : "text-stone-900"
        }`}
      >
        Store
      </span>
    </Link>
  );
};

export default Logo;
