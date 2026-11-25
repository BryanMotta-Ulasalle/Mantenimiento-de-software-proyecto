import HeaderPublic from "../../../components/Navbar/public/HeaderPublic"
import Hero from "../components/Hero"
import CategorySection from "../components/CategorySection"
import OffersSection from "../components/OffersSection"
import NewArrivalsSection from "../components/NewArrivalsSection"
import FaqSection from "../components/FaqSection"
import HomeFooter from "../components/HomeFooter"
import { useState } from "react"

const HomePage = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  return (
    <div id="inicio" className="relative">
      <HeaderPublic isAccountOpen={isAccountOpen} setIsAccountOpen={setIsAccountOpen}/>
      <main>
        <Hero/>
        <div className="bg-bgLight w-full">
          <div className="w-full lg:max-w-360 mx-auto">
            <CategorySection/>
            <OffersSection/>
            <NewArrivalsSection/>
            <FaqSection/>
          </div>
        </div>
      </main>
      <HomeFooter/>
    </div>
  )
}

export default HomePage
