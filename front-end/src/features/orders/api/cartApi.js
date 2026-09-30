import apiClient from "../../../api/client";

const emptyCart = {
  id: null,
  items: [],
  total_price: "0.00",
};

export const fetchCarts = async () => {
  const { data } = await apiClient.get("/carts/", { withAuth: true });
  return data;
};

export const fetchCurrentCart = async (userId) => {
  const carts = await fetchCarts();
  return carts.find((cart) => cart.user === userId) || emptyCart;
};

export const fetchCartItems = async () => {
  const { data } = await apiClient.get("/cart-items/", { withAuth: true });
  return data;
};

export const addCartItem = async ({ productId, quantity = 1 }) => {
  const { data } = await apiClient.post(
    "/cart-items/",
    { product_id: productId, quantity },
    { withAuth: true },
  );
  return data;
};

export const updateCartItem = async (itemId, quantity) => {
  const { data } = await apiClient.patch(
    `/cart-items/${itemId}/`,
    { quantity },
    { withAuth: true },
  );
  return data;
};

export const deleteCartItem = async (itemId) => {
  await apiClient.delete(`/cart-items/${itemId}/`, { withAuth: true });
  return itemId;
};
