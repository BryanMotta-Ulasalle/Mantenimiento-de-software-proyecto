import { PRIVATE_NAV_LINKS } from "../../../constants/navigation";
import useAuth from "../../../hooks/useAuth";
import NavPrivate from "./NavPrivate";

const NavBarPrivate = () => {
  const { user } = useAuth();
  const role = user?.role?.name;
  const visibleLinks = PRIVATE_NAV_LINKS.filter((link) =>
    link.roles.includes(role),
  );

  return (
    <nav className="flex flex-col">
      {visibleLinks.map((link) => (
        <NavPrivate key={link.path} to={link.path} icon={link.icon}>
          {link.label}
        </NavPrivate>
      ))}
    </nav>
  );
};

export default NavBarPrivate;
