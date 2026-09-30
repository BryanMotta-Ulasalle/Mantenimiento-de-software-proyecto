import { Outlet } from "react-router-dom"
import SidebarPrivate from "../components/Navbar/private/SidebarPrivate"

const PrivateLayout = () => {
  return (
    <div className="flex min-h-screen bg-bgLight">
      <SidebarPrivate />
      <main className="min-h-screen flex-1 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default PrivateLayout
