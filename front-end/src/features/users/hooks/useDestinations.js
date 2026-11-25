import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import { fetchDestinations } from "../api/destinationsApi";
const useDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDestinations();
        if (active) {
          setDestinations(data);
          setError("");
        }
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [reloadKey]);
  return {
    destinations,
    isLoading,
    error,
    refetch: () => setReloadKey(key => key + 1)
  };
};
export default useDestinations;
