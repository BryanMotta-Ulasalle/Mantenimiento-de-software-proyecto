import apiClient from "../../../api/client";

export const fetchDashboardSummary = async () => {
  const { data } = await apiClient.get("/dashboard/summary/", {
    withAuth: true,
  });
  return data;
};
