import NavPublic from "./NavPublic"
import {PUBLIC_NAV_LINKS} from "../../../constants/navigation"

const NavBarPublic = ({isMobile, isHome}) => {
  return (
    <nav className={
      isMobile
      ? 'flex flex-col '
      : 'lg:flex flex-row hidden'
    }>
        {
            PUBLIC_NAV_LINKS.map((link)=>(
                <NavPublic key={link.path} isHome={isHome} children={link.label} to={link.path} isMobile={isMobile}/>
            ))
        }
    </nav>
  )
}

export default NavBarPublic