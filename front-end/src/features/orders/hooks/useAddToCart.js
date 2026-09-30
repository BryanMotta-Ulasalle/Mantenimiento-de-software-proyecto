import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import useCart from "./useCart";

const useAddToCart = () => {
  const { addProduct } = useCart();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCart = await addProduct(productId, quantity);
      setData(updatedCart);
      return updatedCart;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo agregar el producto."),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, addToCart, isLoading, error };
};

export default useAddToCart;
