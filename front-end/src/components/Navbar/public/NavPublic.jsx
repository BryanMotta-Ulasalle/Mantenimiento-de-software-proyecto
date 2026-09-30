import { NavLink } from 'react-router-dom'

const NavPublic = ({ children, to, isMobile, isHome }) => {

  const styles = {
    mobile: {
      base: 'block w-full px-4 py-3',
      active: 'border-l-4 border-orange-200 bg-orange-200/20 text-orange-200',
      inactive: 'text-white hover:bg-white/10'
    },
    desktop: {
      isHome:{
        base: 'inline-flex items-center px-4 py-2',
        active: 'border-b-2 border-white text-white',
       inactive: 'text-textGray hover:text-white'
      },
      noHome:{
      base: 'inline-flex items-center px-4 py-2',
      active: 'border-b-2 border-black ',
      inactive: 'text-textGray hover:text-black/50'
      }
    }
  };
  const currentStyles = isMobile
    ? styles.mobile
    : isHome? styles.desktop.isHome: styles.desktop.noHome;

  return (
    <NavLink to={to} className={({ isActive }) => `${currentStyles.base} ${isActive
      ? currentStyles.active
      : currentStyles.inactive
      }`}>
      {children}
    </NavLink>
  )
}

export default NavPublic