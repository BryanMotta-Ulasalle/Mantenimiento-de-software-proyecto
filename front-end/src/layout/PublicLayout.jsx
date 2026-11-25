import { Outlet } from "react-router-dom"
import HeaderPublic from "../components/Navbar/public/HeaderPublic"
import { useState } from "react";

const PublicLayout = () => {

    const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <>
        <HeaderPublic isAccountOpen={isAccountOpen} setIsAccountOpen={setIsAccountOpen}/>
        <main className="min-h-dvh bg-bgLight pt-15" onClick={() => setIsAccountOpen(false)}>
            <div className="w-full lg:max-w-360  mx-auto">
              <Outlet/>
            </div>
        </main>
    </>
  )
}

export default PublicLayout
