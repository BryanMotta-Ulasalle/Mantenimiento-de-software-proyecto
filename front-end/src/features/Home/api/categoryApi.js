import apiClient from "../../../api/client";

export const fetchCategories = async () => {
  const { data } = await apiClient.get("/categories/", { withAuth: false });
  return data;
};

export const createCategory = async (params) => {
  const { data } = await apiClient.post("/categories/", params, {
    withAuth: true,
  });
  return data;
};

export const updateCategory = async (categoryId, params) => {
  const { data } = await apiClient.patch(
    `/categories/${categoryId}/`,
    params,
    { withAuth: true },
  );
  return data;
};

export const deleteCategory = async (categoryId) => {
  await apiClient.delete(`/categories/${categoryId}/`, { withAuth: true });
  return categoryId;
};
