import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchCategories } from "../../Home/api/categoryApi";

const useCategoriesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCategories();
        if (isActive) setCategories(data);
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudieron cargar las categorias.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadCategories();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const refetch = () => setReloadKey((current) => current + 1);

  return { data: categories, categories, isLoading, error, refetch };
};

export default useCategoriesAdmin;
