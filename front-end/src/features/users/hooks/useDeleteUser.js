import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { deleteUserAdmin } from "../api/adminUsersApi";

const useDeleteUser = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deleteUser = async (userId) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const deletedId = await deleteUserAdmin(userId);
      setData(deletedId);
      setSuccess(true);
      return deletedId;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo eliminar el usuario."),
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

  return { data, deleteUser, isLoading, error, success, reset };
};

export default useDeleteUser;
