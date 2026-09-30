import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchUsersAdmin } from "../api/adminUsersApi";

const useUsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchUsersAdmin();
        if (isActive) setUsers(data);
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudieron cargar los usuarios.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadUsers();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const refetch = () => setReloadKey((current) => current + 1);

  return { data: users, users, isLoading, error, refetch };
};

export default useUsersAdmin;
