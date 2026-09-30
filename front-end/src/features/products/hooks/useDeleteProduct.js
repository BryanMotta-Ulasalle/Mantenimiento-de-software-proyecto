import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { deleteProduct as deleteProductRequest } from "../api/productsApi";

const useDeleteProduct = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deleteProduct = async (productId) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const deletedId = await deleteProductRequest(productId);
      setData(deletedId);
      setSuccess(true);
      return deletedId;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo eliminar el producto."),
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

  return { data, deleteProduct, isLoading, error, success, reset };
};

export default useDeleteProduct;
