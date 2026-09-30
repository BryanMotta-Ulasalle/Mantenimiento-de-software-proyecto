import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchRoles } from "../api/rolesApi";

const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadRoles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchRoles();
        if (isActive) setRoles(data);
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(requestError, "No se pudieron cargar los roles."),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadRoles();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const refetch = () => setReloadKey((current) => current + 1);

  return { data: roles, roles, isLoading, error, refetch };
};

export default useRoles;
