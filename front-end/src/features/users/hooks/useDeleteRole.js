import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { deleteRole as deleteRoleRequest } from "../api/rolesApi";

const useDeleteRole = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deleteRole = async (roleId) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const deletedId = await deleteRoleRequest(roleId);
      setData(deletedId);
      setSuccess(true);
      return deletedId;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "No se pudo eliminar el rol."));
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

  return { data, deleteRole, isLoading, error, success, reset };
};

export default useDeleteRole;
