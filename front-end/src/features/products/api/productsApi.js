import apiClient from "../../../api/client";

export const fetchProducts = async (params = {}) => {
  const { data } = await apiClient.get("/products/", {
    withAuth: false,
    params,
  });
  return data;
};

export const fetchProductById = async (id) => {
  const { data } = await apiClient.get(`/products/${id}/`, {
    withAuth: false,
  });
  return data;
};

export const createProduct = async (params) => {
  const { data } = await apiClient.post("/products/", params, {
    withAuth: true,
  });
  return data;
};

export const updateProduct = async (productId, params) => {
  const { data } = await apiClient.patch(`/products/${productId}/`, params, {
    withAuth: true,
  });
  return data;
};

export const deleteProduct = async (productId) => {
  await apiClient.delete(`/products/${productId}/`, { withAuth: true });
  return productId;
};

export const uploadProductImage = async (productId, formData) => {
  const { data } = await apiClient.postForm(`/products/${productId}/images/`, formData, {
    withAuth: true,
  });
  return data;
};

export const setPrimaryProductImage = async (productId, imageId) => {
  const { data } = await apiClient.patch(
    `/products/${productId}/images/${imageId}/primary/`,
    null,
    { withAuth: true },
  );
  return data;
};

export const deleteProductImage = async (productId, imageId) => {
  const { data } = await apiClient.delete(`/products/${productId}/images/${imageId}/`, {
    withAuth: true,
  });
  return data;
};

