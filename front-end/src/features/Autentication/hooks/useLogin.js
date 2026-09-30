import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import useAuth from "../../../hooks/useAuth";

const useLogin = () => {
  const { login } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await login(credentials);
      setData(currentUser);
      return currentUser;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo iniciar sesion."),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, loginUser, isLoading, error };
};

export default useLogin;
