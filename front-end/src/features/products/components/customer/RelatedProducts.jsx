import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import H2 from "../../../../components/H2";
import useProducts from "../../hooks/useProducts";
import { formatProductPrice } from "../../utils/productFormatters";
import { getMainProductImage } from "../../utils/productImages";
import ProductImage from "../shared/ProductImage";

const MAX_RELATED_PRODUCTS = 6;
const scrollButtonClass =
  "grid size-10 place-items-center rounded-full border border-stone-300 bg-white text-stone-700 enabled:hover:border-golden enabled:hover:text-golden disabled:opacity-40";

const RelatedProducts = ({ productId, categoryId }) => {
  const headingId = useId();
  const listId = `${headingId}-list`;
  const listRef = useRef(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const { products } = useProducts({ category: categoryId, is_active: "true" });
  const relatedProducts = products
    .filter((product) => product.id !== productId)
    .slice(0, MAX_RELATED_PRODUCTS);
  const relatedCount = relatedProducts.length;

  useEffect(() => {
    if (relatedCount === 0) return undefined;

    const list = listRef.current;
    const updateScrollControls = () => {
      setCanScrollBack(list.scrollLeft > 1);
      setCanScrollForward(list.scrollWidth - list.clientWidth - list.scrollLeft > 1);
    };
    const observer = new ResizeObserver(updateScrollControls);
    observer.observe(list);
    list.addEventListener("scroll", updateScrollControls, { passive: true });

    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", updateScrollControls);
    };
  }, [relatedCount]);

  const scrollProducts = (direction) => {
    const list = listRef.current;
    list.scrollBy(direction * list.clientWidth, 0);
  };

  if (relatedCount === 0) return null;

  return (
    <section className="px-5 pb-10 lg:px-12" aria-labelledby={headingId}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div id={headingId}>
          <H2>Productos relacionados</H2>
        </div>
        {(canScrollBack || canScrollForward) && (
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Ver productos anteriores"
              aria-controls={listId}
              className={scrollButtonClass}
              disabled={!canScrollBack}
              onClick={() => scrollProducts(-1)}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Ver productos siguientes"
              aria-controls={listId}
              className={scrollButtonClass}
              disabled={!canScrollForward}
              onClick={() => scrollProducts(1)}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <ul
        id={listId}
        ref={listRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 motion-reduce:scroll-auto"
      >
        {relatedProducts.map((product) => (
          <li key={product.id} className="w-40 shrink-0 snap-start sm:w-48">
            <Link
              to={`/tienda/productos/${product.id}/`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-golden"
            >
              <div aria-hidden="true">
                <ProductImage
                  src={getMainProductImage(product)}
                  alt={product.name}
                  className="aspect-[4/3] w-full"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-1 p-3">
                <p className="break-words font-semibold text-stone-900 group-hover:text-golden">
                  {product.name}
                </p>
                <p className="text-sm font-semibold text-stone-700">
                  {formatProductPrice(product.price)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RelatedProducts;
