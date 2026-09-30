import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchCategories } from "../api/categoryApi";

const useCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const categoryData = await fetchCategories();
        if (isMounted) setCategories(categoryData);
      } catch (requestError) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudieron cargar las categorias.",
            ),
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data: categories, categories, isLoading, error };
};

export default useCategory;
