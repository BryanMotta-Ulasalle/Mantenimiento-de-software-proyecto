import { useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { createCategory as createCategoryRequest } from "../../Home/api/categoryApi";

const useCreateCategory = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createCategory = async (params) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const category = await createCategoryRequest(params);
      setData(category);
      setSuccess(true);
      return category;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo crear la categoria."),
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

  return { data, createCategory, isLoading, error, success, reset };
};

export default useCreateCategory;
