import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import H2 from "../../../components/H2";
import ErrorMessage from "../../../components/ErrorMessage";
import { fetchProducts } from "../../products/api/productsApi";
import { getSellingPrice } from "../../products/hooks/useProductPricing";
import ProductCard from "../../products/components/shared/ProductCard";
const OffersSection = () => {
  const [products, setProducts] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let busy = false;
    const load = async () => {
      if (document.hidden || busy) return;
      busy = true;
      try {
        const data = await fetchProducts({
          offers: "true"
        });
        if (active) {
          setProducts(data);
          setError("");
        }
      } catch {
        if (active) setError("No se pudieron cargar las ofertas.");
      } finally {
        busy = false;
      }
    };
    load();
    const refresh = setInterval(load, 30000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", load);
    return () => {
      active = false;
      clearInterval(refresh);
      clearInterval(tick);
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);
  const offers = products.filter(product => getSellingPrice(product, now).active);
  if (!offers.length && !error) return null;
  return <section className="px-5 py-12" aria-label="Ofertas vigentes">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><H2>Ofertas por tiempo limitado</H2><Link to="/tienda/productos" className="text-sm font-medium text-amber-900 underline">Ver catálogo</Link></div>
    <ErrorMessage message={error} />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{offers.map(product => <ProductCard key={product.id} product={product} />)}</div>
  </section>;
};
export default OffersSection;
