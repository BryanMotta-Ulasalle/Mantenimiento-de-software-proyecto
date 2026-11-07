import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../../../../components/ErrorMessage";
import LoadingState from "../../../../components/LoadingState";
import useAuth from "../../../../hooks/useAuth";
import useAddToCart from "../../../orders/hooks/useAddToCart";
import ProductReviews from "../../components/customer/ProductReviews";
import OneProductCard from "../../components/customer/OneProductCard";
import useProductReviews from "../../hooks/useProductReviews";
import useProductById from "../../hooks/useProductById";

const OneProductPage = () => {
  const { id } = useParams();
  const { product, isLoading, error } = useProductById(id);
  const {
    reviews,
    ownReview,
    averageRating,
    isLoading: reviewsLoading,
    isSaving: isSavingReview,
    error: reviewsError,
    saveReview,
    removeReview,
  } = useProductReviews(id);
  const {
    addToCart,
    isLoading: isAdding,
    error: addError,
  } = useAddToCart();
  const { isAuthenticated, isCustomer } = useAuth();
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
      // El hook presenta el error junto al detalle.
    }
  };

  if (isLoading) return <LoadingState message="Cargando producto..." />;
  if (error) return <ErrorMessage message={error} className="m-5" />;
  if (!product) {
    return <ErrorMessage message="Producto no encontrado." className="m-5" />;
  }

  return (
    <section>
      {product.category?.id && (
        <nav aria-label="Ruta del producto" className="px-5 pt-6 lg:px-12">
          <ol className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
            <li className="min-w-0 wrap-anywhere">
              <Link
                to={`/tienda/productos?category=${product.category.id}`}
                className="font-medium text-stone-700 underline-offset-4 hover:underline"
              >
                {product.category.name}
              </Link>
            </li>
            <li aria-current="page" className="min-w-0 wrap-anywhere text-stone-900">
              <span aria-hidden="true" className="mr-2 text-stone-500">&gt;</span>
              {product.name}
            </li>
          </ol>
        </nav>
      )}
      <OneProductCard
        product={product}
        onAddToCart={handleAddToCart}
        isAdding={isAdding}
      />
      <ErrorMessage message={addError} className="mx-5 mb-8" />
      <ProductReviews
        productId={product.id}
        isAuthenticated={isAuthenticated}
        isCustomer={isCustomer}
        reviews={reviews}
        ownReview={ownReview}
        averageRating={averageRating}
        isLoading={reviewsLoading}
        isSaving={isSavingReview}
        error={reviewsError}
        saveReview={saveReview}
        removeReview={removeReview}
      />
    </section>
  );
};

export default OneProductPage;
