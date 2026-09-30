import imageHero from "../utils/image-hero.jpg";
import { ArrowRight, Sparkles} from "lucide-react";
import { PUBLIC_HERO_CONTENT } from "../../../constants/hero"
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";

const Hero = () => {

  const navigate = useNavigate();

  return (
    <section>
      <div
        className="relative min-h-[90vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${imageHero})` }}
      >
        <div className="absolute w-full min-h-[90vh] bg-linear-to-r from-black via-black/90 to-black/50" />
        <div className="lg:max-w-360 w-full lg:ml-60 pt-25 px-5 z-60 absolute flex flex-col gap-7 lg:justify-center  min-h-[90vh]" >
          <div className=" inline-flex w-fit items-center gap-2 rounded-full border border-[#11110F]/10 bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-[#C98C4B]" />
            {PUBLIC_HERO_CONTENT.etiqueta}
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-7xl">
            {PUBLIC_HERO_CONTENT.title1}
            <span className="block text-[#C98C4B]">{PUBLIC_HERO_CONTENT.title2}</span>
          </h1>
          <p className=" max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            {PUBLIC_HERO_CONTENT.parrafo}
          </p>
          <div className="flex flex-row gap-3 ">
            <Button color="golden" variant="normal" className="flex flex-row items-center gap-2" onClick={() => navigate("/tienda/productos")}>
              Ver el catalogo <ArrowRight className="h-4 w-4" />
            </Button>
            <Button color="darkgray" variant="normal" onClick={() => navigate("/login")}>
              Iniciar Sesion
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
