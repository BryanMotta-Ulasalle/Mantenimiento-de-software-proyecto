import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchProductById } from "../api/productsApi";

const useProductById = (id) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    let isMounted = true;

    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const productData = await fetchProductById(id);
        if (isMounted) setProduct(productData);
      } catch (requestError) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudo cargar el producto.",
            ),
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const currentProduct = id ? product : null;
  const currentError = id ? error : "No se proporciono un producto valido.";

  return {
    data: currentProduct,
    product: currentProduct,
    isLoading: id ? isLoading : false,
    error: currentError,
  };
};

export default useProductById;
