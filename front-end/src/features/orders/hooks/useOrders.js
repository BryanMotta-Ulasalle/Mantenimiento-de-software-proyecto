import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchOrders } from "../api/orderApi";

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        if (isActive) setIsLoading(false);
      }
    };

    loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  return { data: orders, orders, isLoading, error };
};

export default useOrders;
