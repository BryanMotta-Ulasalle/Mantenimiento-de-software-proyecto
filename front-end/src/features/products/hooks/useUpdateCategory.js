import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { updateCategory as updateCategoryRequest } from "../../Home/api/categoryApi";

const useUpdateCategory = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateCategory = async (categoryId, params) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const category = await updateCategoryRequest(categoryId, params);
      setData(category);
      setSuccess(true);
      return category;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo actualizar la categoria."),
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

  return { data, updateCategory, isLoading, error, success, reset };
};

export default useUpdateCategory;
