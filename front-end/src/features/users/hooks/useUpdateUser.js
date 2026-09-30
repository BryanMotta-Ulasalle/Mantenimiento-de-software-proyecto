import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { updateUserAdmin } from "../api/adminUsersApi";

const useUpdateUser = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateUser = async (userId, params) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const user = await updateUserAdmin(userId, params);
      setData(user);
      setSuccess(true);
      return user;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo actualizar el usuario."),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setSuccess(false);
  };

  return { data, updateUser, isLoading, error, success, reset };
};

export default useUpdateUser;
