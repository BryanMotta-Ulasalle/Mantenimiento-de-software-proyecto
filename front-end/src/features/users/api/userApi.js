import apiClient from "../../../api/client";

export const updateProfile = async (params) => {
  const { data } = await apiClient.patch("/users/me/", params, {
    withAuth: true,
  });
  return data;
};
