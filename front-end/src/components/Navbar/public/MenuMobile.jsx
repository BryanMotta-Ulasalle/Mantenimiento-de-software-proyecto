import { X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import Button from "../../Button";
import H2 from "../../H2";
import NavBarPublic from "./NavBarPublic";

const MenuMobile = ({ setIsMobileOpen }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setIsMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-10 h-screen w-screen bg-black/30">
      <div className="absolute right-0 top-0 z-50 h-full w-64 bg-black">
        <div className="flex flex-row justify-between border-b-2 border-white/10 p-5">
          <H2 color="white">Menu</H2>
          <Button color="white" onClick={closeMenu} aria-label="Cerrar menu">
            <X />
          </Button>
        </div>
        <div className="py-5">
          <NavBarPublic isMobile />
          <div className="mx-4 mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-white">
            {isAuthenticated ? (
              <>
                <Link to="/carrito" onClick={closeMenu}>
                  Carrito
                </Link>
                <Link to="/cuenta/ordenes" onClick={closeMenu}>
                  Mis Ordenes
                </Link>
                <Link to="/cuenta" onClick={closeMenu}>
                  Perfil
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="cursor-pointer text-left text-red-300"
                >
                  Cerrar Sesion
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu}>
                Iniciar Sesion
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuMobile;
