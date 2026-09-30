import apiClient from "../../../api/client";

export const fetchUsersAdmin = async () => {
  const { data } = await apiClient.get("/users/", { withAuth: true });
  return data;
};

export const updateUserAdmin = async (userId, params) => {
  const { data } = await apiClient.patch(`/users/${userId}/`, params, {
    withAuth: true,
  });
  return data;
};

export const deleteUserAdmin = async (userId) => {
  await apiClient.delete(`/users/${userId}/`, { withAuth: true });
  return userId;
};
