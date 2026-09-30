import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { updateProduct as updateProductRequest } from "../api/productsApi";

const useUpdateProduct = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateProduct = async (productId, params) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const product = await updateProductRequest(productId, params);
      setData(product);
      setSuccess(true);
      return product;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo actualizar el producto."),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setSuccess(false);
  };

  return { data, updateProduct, isLoading, error, success, reset };
};

export default useUpdateProduct;
