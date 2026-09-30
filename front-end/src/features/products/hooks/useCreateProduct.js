import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { createProduct as createProductRequest } from "../api/productsApi";

const useCreateProduct = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createProduct = async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const product = await createProductRequest(params);
      setData(product);
      setSuccess(true);
      return product;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo crear el producto."),
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

  return { data, createProduct, isLoading, error, success, reset };
};

export default useCreateProduct;
