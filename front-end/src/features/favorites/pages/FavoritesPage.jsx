import { Link, useLocation, useNavigate } from "react-router-dom";
import EmptyState from "../../../components/EmptyState";
import ErrorMessage from "../../../components/ErrorMessage";
import H2 from "../../../components/H2";
import LoadingState from "../../../components/LoadingState";
import useAuth from "../../../hooks/useAuth";
import useAddToCart from "../../orders/hooks/useAddToCart";
import ProductGrid from "../../products/components/customer/ProductGrid";
import useFavorites from "../hooks/useFavorites";

const FavoritesPage = () => {
  const {
    favorites,
    favoriteByProductId,
    pendingProductIds,
    isLoading,
    error,
    toggleFavorite,
  } = useFavorites();
  const { addToCart, error: cartError } = useAddToCart();
  const { isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const products = favorites.map((favorite) => favorite.product);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId);
    } catch {
      // El hook presenta el error en esta página.
    }
  };

  const handleToggleFavorite = async (productId) => {
    if (!isCustomer) {
      navigate("/login", {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    try {
      await toggleFavorite(productId);
    } catch {
      // El hook presenta el error junto a la lista.
    }
  };

  if (isLoading) return <LoadingState message="Cargando tus favoritos..." />;

  return (
    <main className="min-h-[60vh] bg-bgLight px-5 py-10 lg:px-10">
      <H2>Mis favoritos</H2>
      <p className="mt-2 text-sm text-stone-600">
        Productos que guardaste para encontrar más tarde.
      </p>
      <ErrorMessage message={error || cartError} className="mt-5" />

      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Todavía no tienes favoritos"
            description="Guarda productos desde el catálogo y aparecerán aquí."
          />
          <Link
            to="/tienda/productos"
            className="mx-auto mt-4 block w-fit rounded-xl bg-black px-4 py-3 font-medium text-white hover:bg-golden"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <ProductGrid
          products={products}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          favoriteByProductId={favoriteByProductId}
          pendingProductIds={pendingProductIds}
          emptyTitle="No tienes favoritos"
          emptyDescription="Guarda productos desde el catálogo."
        />
      )}
    </main>
  );
};

export default FavoritesPage;
