import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import useAuth from "../../../hooks/useAuth";
import { updateProfile } from "../api/userApi";

const useUpdateProfile = () => {
  const { updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const update = async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await updateProfile(params);

      setData(updatedUser);
      updateUser(updatedUser);
      return updatedUser;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo actualizar el perfil."),
      );
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, update, error };
};

export default useUpdateProfile;
