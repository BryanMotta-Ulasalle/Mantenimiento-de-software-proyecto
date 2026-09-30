import { ChevronDown, Menu, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useCart from "../../../features/orders/hooks/useCart";
import useAuth from "../../../hooks/useAuth";
import Button from "../../Button";
import ButtonLink from "../../ButtonLink";
import AccountList from "../private/AccountList";
import Logo from "./Logo";
import MenuMobile from "./MenuMobile";
import NavBarPublic from "./NavBarPublic";

const HeaderPublic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const isHome = location.pathname === "/";
  const { isAuthenticated, isAdmin, logout, user, isEmployee } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const foregroundClass = isHome ? "text-white" : "text-stone-900";

  return (
    <header
      className={`fixed z-100 h-15 w-full ${
        isHome
          ? "border-b border-white/30 bg-black/50 backdrop-blur-xl"
          : "border-b border-stone-200 bg-white"
      }`}
    >
      <div className="mx-auto flex h-15 w-full items-center justify-between px-5 lg:max-w-360 lg:px-10">
        <Logo isHome={isHome} />
        <NavBarPublic isHome={isHome} />

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link
            to="/carrito"
            className={`relative rounded-xl p-2 hover:bg-golden/10 ${foregroundClass}`}
            aria-label={`Carrito con ${itemCount} productos`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-golden px-1 text-center text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {!isAuthenticated ? (
            <ButtonLink
              to="/login"
              color={isHome ? "golden" : "bgBlack"}
              size="md"
              className="hidden sm:block"
            >
              Iniciar Sesion
            </ButtonLink>
          ) : (
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsAccountOpen((current) => !current)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 ${
                  isHome ? "bg-golden text-white" : "text-stone-900"
                }`}
              >
                {user?.name?.split(" ")[0] || "Cuenta"}
                <ChevronDown className="h-4 w-4" />
              </button>
              {isAccountOpen && (
                <AccountList
                  name={user?.name}
                  email={user?.email}
                  role={user?.role?.name}
                  handleLogout={handleLogout}
                  isAdmin={isAdmin}
                  isEmployee={isEmployee}
                />
              )}
            </div>
          )}
        </div>

        <Button
          color={isHome ? "white" : ""}
          onClick={() => setIsMobileOpen((current) => !current)}
          className="lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu />
        </Button>

        {isMobileOpen && (
          <MenuMobile setIsMobileOpen={setIsMobileOpen} />
        )}
      </div>
    </header>
  );
};

export default HeaderPublic;
