import { ImageOff } from "lucide-react";

const ProductImage = ({ src, alt, className = "" }) => {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-linear-to-br from-stone-100 to-stone-200 text-stone-400 ${className}`}
        role="img"
        aria-label={`Sin imagen para ${alt}`}
      >
        <ImageOff className="h-9 w-9" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={`object-cover ${className}`} />;
};

export default ProductImage;
