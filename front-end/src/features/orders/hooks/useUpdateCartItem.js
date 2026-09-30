import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import useCart from "./useCart";

const useUpdateCartItem = () => {
  const { changeItemQuantity } = useCart();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateItem = async (itemId, quantity) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCart = await changeItemQuantity(itemId, quantity);
      setData(updatedCart);
      return updatedCart;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo actualizar la cantidad."),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, updateItem, isLoading, error };
};

export default useUpdateCartItem;
