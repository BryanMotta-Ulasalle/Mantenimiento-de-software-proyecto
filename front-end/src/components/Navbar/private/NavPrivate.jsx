import { NavLink } from "react-router-dom"

const NavPrivate = ({to, children,icon:Icon}) => {
  return (
    <NavLink to={to} className={({isActive}) => `flex flex-row gap-3 px-3 py-2 rounded-xl mx-2 my-1 font-medium ${isActive ? "text-white bg-white/20" : "text-gray-400 hover:bg-white/10 hover:text-white/80"}` }>
      {Icon&& <Icon/>}{children}</NavLink>
  )
}

export default NavPrivate
