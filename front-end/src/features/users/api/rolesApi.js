import apiClient from "../../../api/client";

export const fetchRoles = async () => {
  const { data } = await apiClient.get("/roles/", { withAuth: true });
  return data;
};

export const createRole = async (params) => {
  const { data } = await apiClient.post("/roles/", params, {
    withAuth: true,
  });
  return data;
};

export const updateRole = async (roleId, params) => {
  const { data } = await apiClient.patch(`/roles/${roleId}/`, params, {
    withAuth: true,
  });
  return data;
};

export const deleteRole = async (roleId) => {
  await apiClient.delete(`/roles/${roleId}/`, { withAuth: true });
  return roleId;
};
