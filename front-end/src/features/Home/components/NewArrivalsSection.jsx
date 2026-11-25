import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import H2 from "../../../components/H2";
import ErrorMessage from "../../../components/ErrorMessage";
import LoadingState from "../../../components/LoadingState";
import ProductCard from "../../products/components/shared/ProductCard";
import useProducts from "../../products/hooks/useProducts";

const NewArrivalsSection = () => {
  const { products, isLoading, error, refetch } = useProducts({
    ordering: "-created_at",
    is_active: "true",
    stock: "available",
  });

  return (
    <section id="new-arrivals" aria-labelledby="new-arrivals-title" className="scroll-mt-24 px-5 py-14 lg:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-800">
            <Sparkles className="size-4" aria-hidden="true" /> Lo último de la tienda
          </p>
          <div id="new-arrivals-title"><H2>Recién llegados</H2></div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
            Descubre los productos que acabamos de sumar a nuestro catálogo.
          </p>
        </div>
        <Link to="/tienda/productos" className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition-colors hover:border-golden hover:text-amber-800">
          Explorar el catálogo <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {isLoading ? (
        <LoadingState message="Cargando recién llegados..." />
      ) : error ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <ErrorMessage message={error} />
          <button type="button" onClick={refetch} className="mt-3 text-sm font-medium text-amber-900 underline">Volver a intentar</button>
        </div>
      ) : products.length ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-600">Pronto encontrarás nuevos productos aquí.</p>
      )}
    </section>
  );
};

export default NewArrivalsSection;
