import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchProducts } from "../api/productsApi";

const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const productData = await fetchProducts(JSON.parse(filtersKey));
        if (isMounted) setProducts(productData);
      } catch (requestError) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudieron cargar los productos.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasLoaded(true);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [filtersKey, reloadKey]);

  const refetch = () => setReloadKey((current) => current + 1);

  return {
    data: products,
    products,
    isLoading,
    isInitialLoading: isLoading && !hasLoaded,
    isRefreshing: isLoading && hasLoaded,
    error,
    refetch,
  };
};

export default useProducts;
