import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { updateOrderStatus } from "../api/orderApi";

const useUpdateOrderStatus = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStatus = async (orderId, status) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedStatus = await updateOrderStatus(orderId, status);
      setData(updatedStatus);
      return updatedStatus;
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "No se pudo actualizar el estado del pedido.",
        ),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { data, updateStatus, isLoading, error, reset };
};

export default useUpdateOrderStatus;
