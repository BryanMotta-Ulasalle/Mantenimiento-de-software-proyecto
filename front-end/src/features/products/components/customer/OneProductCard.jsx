import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import Button from "../../../../components/Button";
import {
  formatProductPrice,
  isProductAvailable,
} from "../../utils/productFormatters";
import {
  getMainProductImage,
  getProductImages,
} from "../../utils/productImages";
import ProductImage from "../shared/ProductImage";

const OneProductCard = ({ product, onAddToCart, isAdding }) => {
  const images = getProductImages(product);
  const [selectedImage, setSelectedImage] = useState(() =>
    getMainProductImage(product),
  );
  const available = isProductAvailable(product);

  return (
    <article className="grid gap-10 px-5 py-10 lg:grid-cols-2 lg:px-12 lg:py-16">
      <div className="flex flex-col gap-4">
        <ProductImage
          src={selectedImage}
          alt={product.name}
          className="aspect-square w-full rounded-2xl"
        />

        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-3">
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImage(image.image_url)}
                className={`overflow-hidden rounded-xl border-2 ${
                  selectedImage === image.image_url
                    ? "border-golden"
                    : "border-transparent"
                }`}
                aria-label={`Ver imagen de ${product.name}`}
              >
                <ProductImage
                  src={image.image_url}
                  alt={product.name}
                  className="aspect-square w-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center gap-5">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-golden">
            {product.category?.name || "Sin categoria"}
          </p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              available
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {available ? "Disponible" : "No disponible"}
          </span>
        </div>

        <h1 className="font-playfair text-4xl font-semibold text-stone-900 lg:text-6xl">
          {product.name}
        </h1>
        <p className="text-3xl font-bold text-stone-900">
          {formatProductPrice(product.price)}
        </p>
        <p className="leading-7 text-stone-600">{product.description}</p>
        <p className="font-medium text-stone-700">
          {Number(product.stock || 0)} unidades disponibles
        </p>

        <Button
          color="black"
          size="md"
          className="flex gap-2"
          disabled={!available || isAdding}
          onClick={() => onAddToCart(product.id)}
        >
          <ShoppingBag className="h-5 w-5" />
          {isAdding ? "Agregando..." : "Agregar al carrito"}
        </Button>
      </div>
    </article>
  );
};

export default OneProductCard;
