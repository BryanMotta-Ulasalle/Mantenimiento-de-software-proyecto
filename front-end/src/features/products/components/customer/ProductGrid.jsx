import EmptyState from "../../../../components/EmptyState";
import ProductCard from "../shared/ProductCard";

const ProductGrid = ({
  products,
  onAddToCart,
  emptyTitle = "No hay productos disponibles",
  emptyDescription = "Vuelve a intentarlo mas tarde.",
}) => {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 px-5 py-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
