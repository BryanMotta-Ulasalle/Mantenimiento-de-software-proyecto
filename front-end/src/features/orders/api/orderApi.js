import apiClient from "../../../api/client";

export const fetchOrders = async () => {
  const { data } = await apiClient.get("/orders/", { withAuth: true });
  return data;
};

export const fetchOrderById = async (orderId) => {
  const { data } = await apiClient.get(`/orders/${orderId}/`, {
    withAuth: true,
  });
  return data;
};

export const createOrder = async (shippingAddress) => {
  const { data } = await apiClient.post(
    "/orders/",
    { shipping_address: shippingAddress },
    { withAuth: true },
  );
  return data;
};
