import EmptyState from "../../../../components/EmptyState";
import ProductCard from "../shared/ProductCard";

const ProductGrid = ({
  products,
  onAddToCart,
  onToggleFavorite,
  favoriteByProductId = {},
  pendingProductIds = new Set(),
  favoritesLoading = false,
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
          onToggleFavorite={onToggleFavorite}
          isFavorite={Boolean(favoriteByProductId[product.id])}
          favoriteDisabled={
            favoritesLoading || pendingProductIds.has(product.id)
          }
        />
      ))}
    </div>
  );
};

export default ProductGrid;
