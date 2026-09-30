import apiClient from "../../../api/client";

export const login = async (credentials) => {
  const { data } = await apiClient.post("/auth/login/", credentials, {
    withAuth: false,
  });
  return data;
};

export const register = async (credentials) => {
  const { data } = await apiClient.post("/auth/register/", credentials, {
    withAuth: false,
  });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await apiClient.get("/users/me/", { withAuth: true });
  return data;
};
