import { useLocation, useNavigate } from "react-router-dom";
import ErrorMessage from "../../../../components/ErrorMessage";
import LoadingState from "../../../../components/LoadingState";
import useAuth from "../../../../hooks/useAuth";
import useAddToCart from "../../../orders/hooks/useAddToCart";
import ProductFilters from "../../components/shared/ProductFilters";
import ProductGrid from "../../components/customer/ProductGrid";
import useCategory from "../../../Home/hooks/useCategory";
import useProducts from "../../hooks/useProducts";
import { useState } from "react";

const ProductsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    is_active: "true",
  });
  const { products, isInitialLoading, isRefreshing, error } = useProducts(filters);
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategory();
  const {
    addToCart,
    error: addError,
  } = useAddToCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    try {
      await addToCart(productId);
    } catch {
      // El hook expone el mensaje debajo del catalogo.
    }
  };

  if (isInitialLoading || categoriesLoading) {
    return <LoadingState message="Cargando productos..." />;
  }
  return (
    <main className="bg-bgLight">
      <div className="px-5 pt-8">
        <ProductFilters
          filters={filters}
          categories={categories}
          onChange={setFilters}
          onClear={() =>
            setFilters({ search: "", category: "", is_active: "true" })
          }
        />
      </div>
      <ErrorMessage message={error || categoriesError} className="mx-5 mt-5" />
      <div className="relative" aria-busy={isRefreshing}>
        {isRefreshing && (
          <span className="absolute right-8 top-4 z-10 rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white shadow-sm">
            Actualizando...
          </span>
        )}
        <div className={isRefreshing ? "opacity-60 transition-opacity" : ""}>
          <ProductGrid
            products={products}
            onAddToCart={handleAddToCart}
            emptyTitle="No se encontraron productos"
            emptyDescription="No se encontraron productos con los filtros seleccionados."
          />
        </div>
      </div>
      <ErrorMessage message={addError} className="mx-5 mb-8" />
    </main>
  );
};

export default ProductsPage;
