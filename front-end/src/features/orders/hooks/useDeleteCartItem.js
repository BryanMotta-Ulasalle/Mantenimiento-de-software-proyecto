import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import useCart from "./useCart";

const useDeleteCartItem = () => {
  const { removeItem } = useCart();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteItem = async (itemId) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCart = await removeItem(itemId);
      setData(updatedCart);
      return updatedCart;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo eliminar el producto."),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, deleteItem, isLoading, error };
};

export default useDeleteCartItem;
