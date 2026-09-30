import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { createRole as createRoleRequest } from "../api/rolesApi";

const useCreateRole = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createRole = async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const role = await createRoleRequest(params);
      setData(role);
      setSuccess(true);
      return role;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "No se pudo crear el rol."));
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

  return { data, createRole, isLoading, error, success, reset };
};

export default useCreateRole;
