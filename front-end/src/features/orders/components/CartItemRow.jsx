import { Minus, Plus, Trash2 } from "lucide-react";
import Button from "../../../components/Button";
import ProductImage from "../../products/components/shared/ProductImage";
import { formatProductPrice } from "../../products/utils/productFormatters";
import { getMainProductImage } from "../../products/utils/productImages";

const CartItemRow = ({ item, onUpdate, onDelete, disabled }) => {
  const product = item.product;
  const quantity = Number(item.quantity || 0);
  const stock = Number(product?.stock || 0);
  const subtotal = Number(product?.price || 0) * quantity;

  return (
    <article className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
      <ProductImage
        src={getMainProductImage(product)}
        alt={product?.name || "Producto"}
        className="aspect-square w-full rounded-xl sm:w-28"
      />

      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-golden">
          {product?.category?.name || "Sin categoria"}
        </p>
        <h2 className="text-lg font-semibold text-stone-900">
          {product?.name || "Producto no disponible"}
        </h2>
        <p className="text-sm text-stone-500">
          {formatProductPrice(product?.price)} por unidad
        </p>

        <div className="mt-2 flex items-center gap-2">
          <Button
            size="sm"
            className="border border-stone-300"
            disabled={disabled}
            onClick={() => onUpdate(item.id, quantity - 1)}
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-8 text-center font-semibold">{quantity}</span>
          <Button
            size="sm"
            className="border border-stone-300"
            disabled={disabled || quantity >= stock || !product?.status}
            onClick={() => onUpdate(item.id, quantity + 1)}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDelete(item.id)}
            className="ml-2 cursor-pointer rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Eliminar ${product?.name || "producto"}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-right text-lg font-bold text-stone-900">
        {formatProductPrice(subtotal)}
      </p>
    </article>
  );
};

export default CartItemRow;
