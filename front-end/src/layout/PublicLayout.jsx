import { Outlet } from "react-router-dom"
import HeaderPublic from "../components/Navbar/public/HeaderPublic"

const PublicLayout = () => {
  return (
    <>
        <HeaderPublic/>
        <main className="min-h-dvh bg-bgLight pt-15">
            <div className="w-full lg:max-w-360  mx-auto">
              <Outlet/>
            </div>
        </main>
    </>
  )
}

export default PublicLayout
