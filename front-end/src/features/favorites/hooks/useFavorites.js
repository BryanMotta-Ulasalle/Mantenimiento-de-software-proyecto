import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import useAuth from "../../../hooks/useAuth";
import {
  createFavorite,
  deleteFavorite,
  fetchFavorites,
} from "../api/favoritesApi";

const useFavorites = () => {
  const { isCustomer, isLoading: isAuthLoading, user } = useAuth();
  const [favoriteState, setFavoriteState] = useState({ userId: null, items: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingProductIds, setPendingProductIds] = useState(() => new Set());
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isAuthLoading) return undefined;

    if (!isCustomer || !user?.id) return undefined;

    let isActive = true;

    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const favoriteData = await fetchFavorites();
        if (isActive) {
          setFavoriteState({ userId: user.id, items: favoriteData });
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudieron cargar tus favoritos.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadFavorites();

    return () => {
      isActive = false;
    };
  }, [isAuthLoading, isCustomer, reloadKey, user?.id]);

  const favorites = useMemo(
    () =>
      isCustomer && favoriteState.userId === user?.id
        ? favoriteState.items
        : [],
    [favoriteState.items, favoriteState.userId, isCustomer, user?.id],
  );

  const favoriteByProductId = useMemo(
    () =>
      Object.fromEntries(
        favorites.map((favorite) => [favorite.product.id, favorite]),
      ),
    [favorites],
  );

  const toggleFavorite = async (productId) => {
    if (!isCustomer) {
      throw new Error("Inicia sesión como cliente para guardar favoritos.");
    }

    setPendingProductIds((current) => new Set(current).add(productId));
    setError(null);

    try {
      const existingFavorite = favoriteByProductId[productId];
      if (existingFavorite) {
        await deleteFavorite(existingFavorite.id);
        setFavoriteState((current) => ({
          userId: user.id,
          items: (current.userId === user.id ? current.items : []).filter(
            (favorite) => favorite.id !== existingFavorite.id,
          ),
        }));
      } else {
        const createdFavorite = await createFavorite(productId);
        setFavoriteState((current) => {
          const currentFavorites = current.userId === user.id ? current.items : [];
          return {
            userId: user.id,
            items: currentFavorites.some(
            (favorite) => favorite.product.id === createdFavorite.product.id,
          )
              ? currentFavorites
              : [...currentFavorites, createdFavorite],
          };
        });
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "No se pudo actualizar tu lista de favoritos.",
        ),
      );
      throw requestError;
    } finally {
      setPendingProductIds((current) => {
        const next = new Set(current);
        next.delete(productId);
        return next;
      });
    }
  };

  const refetch = () => setReloadKey((current) => current + 1);

  return {
    favorites,
    favoriteByProductId,
    pendingProductIds,
    isLoading: isAuthLoading || (isCustomer && isLoading),
    error,
    toggleFavorite,
    refetch,
  };
};

export default useFavorites;
