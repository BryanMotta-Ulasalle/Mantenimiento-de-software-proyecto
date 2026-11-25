import useProductPricing from "../../hooks/useProductPricing";
import { formatProductPrice } from "../../utils/productFormatters";
const ProductPrice = ({
  product,
  countdown = true
}) => {
  const {
    active,
    price,
    remaining
  } = useProductPricing(product);
  const seconds = Math.floor(remaining / 1000);
  const days = Math.floor(seconds / 86400);
  const clock = [Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, "0")).join(":");
  return <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
      {active && <del className="text-sm font-normal text-stone-500">{formatProductPrice(product.price)}</del>}
      <span className={active ? "font-semibold text-red-700" : ""}>{formatProductPrice(price)}</span>
      {active && countdown && <span className="basis-full text-xs font-medium text-amber-900">Oferta · Termina en {days > 0 ? `${days} d ` : ""}{clock}</span>}
    </span>;
};
export default ProductPrice;
