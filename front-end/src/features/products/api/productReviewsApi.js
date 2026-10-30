import apiClient from "../../../api/client";

export const fetchProductReviews = async (productId, withAuth = false) => {
  const { data } = await apiClient.get("/reviews/", {
    withAuth,
    params: { product: productId },
  });
  return data;
};

export const createProductReview = async (payload) => {
  const { data } = await apiClient.post("/reviews/", payload, {
    withAuth: true,
  });
  return data;
};

export const updateProductReview = async (reviewId, payload) => {
  const { data } = await apiClient.patch(`/reviews/${reviewId}/`, payload, {
    withAuth: true,
  });
  return data;
};

export const deleteProductReview = async (reviewId) => {
  await apiClient.delete(`/reviews/${reviewId}/`, { withAuth: true });
  return reviewId;
};
