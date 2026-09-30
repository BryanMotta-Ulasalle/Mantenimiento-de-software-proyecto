import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchDashboardSummary } from "../api/dashboardApi";

const useDashboardAdmin = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const dashboardData = await fetchDashboardSummary();

        if (isActive) {
          setData(dashboardData);
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudo cargar el resumen administrativo.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const refetch = () => setReloadKey((current) => current + 1);

  return { data, isLoading, error, refetch };
};

export default useDashboardAdmin;
