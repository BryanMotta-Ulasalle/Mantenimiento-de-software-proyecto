import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchOrders } from "../api/orderApi";

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const orderData = await fetchOrders();
        if (isActive) setOrders(orderData);
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudieron cargar las ordenes.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
          setHasLoaded(true);
        }
      }
    };

    loadOrders();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const refetch = () => setReloadKey((current) => current + 1);

  return {
    data: orders,
    orders,
    isLoading,
    isInitialLoading: isLoading && !hasLoaded,
    isRefreshing: isLoading && hasLoaded,
    error,
    refetch,
  };
};

export default useOrders;
