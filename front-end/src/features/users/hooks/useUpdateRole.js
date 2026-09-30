import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { updateRole as updateRoleRequest } from "../api/rolesApi";

const useUpdateRole = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateRole = async (roleId, params) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const role = await updateRoleRequest(roleId, params);
      setData(role);
      setSuccess(true);
      return role;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo actualizar el rol."),
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

  return { data, updateRole, isLoading, error, success, reset };
};

export default useUpdateRole;
