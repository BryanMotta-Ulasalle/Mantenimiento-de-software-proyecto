import { Link } from "react-router-dom";
import Button from "../../../../components/Button";
import {
  formatProductPrice,
  isProductAvailable,
} from "../../utils/productFormatters";
import { getMainProductImage } from "../../utils/productImages";
import ProductImage from "./ProductImage";

const ProductCard = ({ product, onAddToCart, actions }) => {
  const available = isProductAvailable(product);

  return (
    <article className="flex min-h-90 w-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        to={`/tienda/productos/${product.id}/`}
        className="block h-48 overflow-hidden bg-stone-100 lg:h-56"
      >
        <ProductImage
          src={getMainProductImage(product)}
          alt={product.name}
          className="h-full w-full transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4 lg:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-golden">
            {product.category?.name || "Sin categoria"}
          </p>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              available
                ? "bg-emerald-50 text-emerald-700"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {available ? "Disponible" : "No disponible"}
          </span>
        </div>

        <Link
          to={`/tienda/productos/${product.id}/`}
          className="text-lg font-semibold text-stone-900 hover:text-golden"
        >
          {product.name}
        </Link>

        <p className="text-sm text-stone-500">
          Stock: {Number(product.stock || 0)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-lg font-bold text-stone-900">
            {formatProductPrice(product.price)}
          </span>
          {onAddToCart && (
            <Button
              color="black"
              size="sm"
              disabled={!available}
              onClick={() => onAddToCart(product.id)}
            >
              Agregar
            </Button>
          )}
          {actions}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
