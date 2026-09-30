import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { deleteCategory as deleteCategoryRequest } from "../../Home/api/categoryApi";

const useDeleteCategory = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deleteCategory = async (categoryId) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const deletedId = await deleteCategoryRequest(categoryId);
      setData(deletedId);
      setSuccess(true);
      return deletedId;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo eliminar la categoria."),
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

  return { data, deleteCategory, isLoading, error, success, reset };
};

export default useDeleteCategory;
