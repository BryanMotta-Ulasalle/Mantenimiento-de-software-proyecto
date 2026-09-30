import HeaderPublic from "../../../components/Navbar/public/HeaderPublic"
import Hero from "../components/Hero"
import CategorySection from "../components/CategorySection"

const HomePage = () => {
  return (
    <div className="relative">
        <HeaderPublic/>
        <Hero/>
        <div className="bg-bgLight w-full">
          <div className="w-full lg:max-w-360 mx-auto">
            <CategorySection/>
          </div>
        </div>
    </div>
  )
}

export default HomePage
