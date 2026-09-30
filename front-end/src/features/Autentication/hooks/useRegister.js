import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { register } from "../api/AuthApi";

const useRegister = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerUser = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const registeredUser = await register(credentials);
      setData(registeredUser);
      return registeredUser;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo completar el registro."),
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, registerUser, isLoading, error };
};

export default useRegister;
