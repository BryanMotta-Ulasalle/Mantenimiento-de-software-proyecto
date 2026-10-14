import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchOrderById } from "../api/orderApi";

const useOrderDetail = (orderId) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderId));
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!orderId) return undefined;

    let isActive = true;

    const loadOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchOrderById(orderId);
        if (isActive) setOrder(data);
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(requestError, "No se pudo cargar la orden."),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadOrder();

    return () => {
      isActive = false;
    };
  }, [orderId, reloadKey]);

  const refetch = () => setReloadKey((current) => current + 1);

  return {
    data: orderId ? order : null,
    order: orderId ? order : null,
    isLoading: orderId ? isLoading : false,
    error: orderId ? error : null,
    refetch,
  };
};

export default useOrderDetail;
