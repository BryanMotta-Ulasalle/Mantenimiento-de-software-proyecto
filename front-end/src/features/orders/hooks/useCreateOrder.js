import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { createOrder } from "../api/orderApi";
import useCart from "./useCart";

const useCreateOrder = () => {
  const { refreshCart } = useCart();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitOrder = async (shippingAddress) => {
    try {
      setIsLoading(true);
      setError(null);
      const order = await createOrder(shippingAddress);
      setData(order);
      await refreshCart();
      return order;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo crear la orden."),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, submitOrder, isLoading, error };
};

export default useCreateOrder;
