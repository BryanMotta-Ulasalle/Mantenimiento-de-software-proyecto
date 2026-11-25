import apiClient from "../../../api/client";
export const fetchDestinations = async () => {
  const {
    data
  } = await apiClient.get("/shipping-destinations/", {
    withAuth: true
  });
  return data;
};
export const saveDestination = async (id, values) => {
  const url = id ? `/shipping-destinations/${id}/` : "/shipping-destinations/";
  const {
    data
  } = await apiClient({
    url,
    method: id ? "patch" : "post",
    data: values,
    withAuth: true
  });
  return data;
};
export const deleteDestination = async id => {
  await apiClient.delete(`/shipping-destinations/${id}/`, {
    withAuth: true
  });
};
