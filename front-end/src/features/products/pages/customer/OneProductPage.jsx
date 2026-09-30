import { useLocation, useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../../../../components/ErrorMessage";
import LoadingState from "../../../../components/LoadingState";
import useAuth from "../../../../hooks/useAuth";
import useAddToCart from "../../../orders/hooks/useAddToCart";
import OneProductCard from "../../components/customer/OneProductCard";
import useProductById from "../../hooks/useProductById";

const OneProductPage = () => {
  const { id } = useParams();
  const { product, isLoading, error } = useProductById(id);
  const {
    addToCart,
    isLoading: isAdding,
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
      <OneProductCard
        product={product}
        onAddToCart={handleAddToCart}
        isAdding={isAdding}
      />
      <ErrorMessage message={addError} className="mx-5 mb-8" />
    </section>
  );
};

export default OneProductPage;
