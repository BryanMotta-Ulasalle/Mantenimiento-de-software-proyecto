import { useNavigate } from "react-router-dom";
import EmptyState from "../../../components/EmptyState";
import ErrorMessage from "../../../components/ErrorMessage";
import H2 from "../../../components/H2";
import LoadingState from "../../../components/LoadingState";
import CartItemRow from "../components/CartItemRow";
import CheckoutForm from "../components/CheckoutForm";
import useCart from "../hooks/useCart";
import useCreateOrder from "../hooks/useCreateOrder";
import useDeleteCartItem from "../hooks/useDeleteCartItem";
import useUpdateCartItem from "../hooks/useUpdateCartItem";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, isLoading, error } = useCart();
  const {
    updateItem,
    isLoading: isUpdating,
    error: updateError,
  } = useUpdateCartItem();
  const {
    deleteItem,
    isLoading: isDeleting,
    error: deleteError,
  } = useDeleteCartItem();
  const {
    submitOrder,
    isLoading: isCreatingOrder,
    error: orderError,
  } = useCreateOrder();

  const handleUpdate = async (itemId, quantity) => {
    try {
      await updateItem(itemId, quantity);
    } catch {
      // El hook expone el error debajo de la lista.
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteItem(itemId);
    } catch {
      // El hook expone el error debajo de la lista.
    }
  };

  const handleCheckout = async (shippingAddress) => {
    try {
      const order = await submitOrder(shippingAddress);
      navigate("/cuenta/ordenes", {
        replace: true,
        state: { createdOrderId: order.id },
      });
    } catch {
      // Los errores de stock y validacion se muestran en CheckoutForm.
    }
  };

  if (isLoading) {
    return <LoadingState message="Cargando carrito..." />;
  }

  if (error && cart.items.length === 0) {
    return <ErrorMessage message={error} className="m-5" />;
  }

  if (cart.items.length === 0) {
    return (
      <div className="px-5 py-16">
        <EmptyState
          title="Tu carrito esta vacio"
          description="Explora el catalogo y agrega tu primer producto."
        />
      </div>
    );
  }

  const mutationError = updateError || deleteError;
  const isMutating = isUpdating || isDeleting || isCreatingOrder;

  return (
    <section className="px-5 py-10 lg:px-10">
      <H2>Tu carrito</H2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              disabled={isMutating}
            />
          ))}
          <ErrorMessage message={mutationError} />
        </div>

        <CheckoutForm
          total={cart.total_price}
          onSubmit={handleCheckout}
          isLoading={isCreatingOrder}
          error={orderError}
        />
      </div>
    </section>
  );
};

export default CartPage;
