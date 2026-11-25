import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const HomeFooter = () => (
  <footer className="bg-darkGray text-stone-300">
    <div className="mx-auto max-w-360 px-5 pb-6 pt-14 lg:pt-16">
      <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        <div className="sm:col-span-2 lg:col-span-2">
          <Link to="/" aria-label="Store, inicio" className="inline-flex items-center gap-3 text-xl font-semibold text-white">
            <span className="flex size-11 items-center justify-center rounded-xl bg-golden text-darkGray"><ShoppingBag className="size-6" aria-hidden="true" /></span> Store
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-stone-400">Encuentra algo para ti. Explora nuestras categorías, descubre novedades y sigue tus pedidos desde un solo lugar.</p>
          <Link to="/tienda/productos" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-goldenHover hover:text-white">Descubrir la tienda <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <nav aria-label="Enlaces de la tienda">
          <p className="mb-5 text-sm font-semibold text-white">La tienda</p>
          <ul className="space-y-4 text-sm">
            <li><Link to="/tienda/productos" className="hover:text-goldenHover">Todos los productos</Link></li>
            <li><a href="#new-arrivals" className="hover:text-goldenHover">Recién llegados</a></li>
            <li><a href="#preguntas-frecuentes" className="hover:text-goldenHover">Preguntas frecuentes</a></li>
          </ul>
        </nav>
        <nav aria-label="Enlaces de tu cuenta">
          <p className="mb-5 text-sm font-semibold text-white">Tu cuenta</p>
          <ul className="space-y-4 text-sm">
            <li><Link to="/cuenta" className="hover:text-goldenHover">Mi perfil y direcciones</Link></li>
            <li><Link to="/cuenta/ordenes" className="hover:text-goldenHover">Mis pedidos</Link></li>
            <li><Link to="/cuenta/favoritos" className="hover:text-goldenHover">Mis favoritos</Link></li>
            <li><Link to="/recuperar-cuenta" className="hover:text-goldenHover">Recuperar cuenta</Link></li>
          </ul>
        </nav>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-stone-400">
        <p>© {new Date().getFullYear()} Store. Todos los derechos reservados.</p>
        <a href="#inicio" className="inline-flex items-center gap-2 hover:text-white">Volver al inicio <ArrowUpRight className="size-4" aria-hidden="true" /></a>
      </div>
    </div>
  </footer>
);

export default HomeFooter;
