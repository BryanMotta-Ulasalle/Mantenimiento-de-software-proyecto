import apiClient from "../../../api/client";

export const fetchFavorites = async () => {
  const { data } = await apiClient.get("/favorites/", { withAuth: true });
  return data;
};

export const createFavorite = async (productId) => {
  const { data } = await apiClient.post(
    "/favorites/",
    { product_id: productId },
    { withAuth: true },
  );
  return data;
};

export const deleteFavorite = async (favoriteId) => {
  await apiClient.delete(`/favorites/${favoriteId}/`, { withAuth: true });
  return favoriteId;
};
