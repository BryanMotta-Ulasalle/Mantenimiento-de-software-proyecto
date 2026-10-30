import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../api/errors";
import useAuth from "../../../hooks/useAuth";
import {
  createProductReview,
  deleteProductReview,
  fetchProductReviews,
  updateProductReview,
} from "../api/productReviewsApi";

const useProductReviews = (productId) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProductReviews(productId, isAuthenticated);
      setReviews(data);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudieron cargar las reseñas."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, productId]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!productId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProductReviews(productId, isAuthenticated);
        if (isActive) setReviews(data);
      } catch (requestError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudieron cargar las reseñas.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [isAuthenticated, productId]);

  const ownReview = useMemo(
    () => reviews.find((review) => review.is_mine) || null,
    [reviews],
  );
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
      reviews.length
    );
  }, [reviews]);

  const saveReview = async ({ rating, comment }) => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = { rating: Number(rating), comment: comment.trim() };
      const savedReview = ownReview
        ? await updateProductReview(ownReview.id, payload)
        : await createProductReview({ product_id: productId, ...payload });
      setReviews((current) => {
        const withoutCurrent = current.filter(
          (review) => review.id !== savedReview.id,
        );
        return [savedReview, ...withoutCurrent];
      });
      return savedReview;
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo guardar la reseña."),
      );
      throw requestError;
    } finally {
      setIsSaving(false);
    }
  };

  const removeReview = async () => {
    if (!ownReview) return;
    setIsSaving(true);
    setError(null);
    try {
      await deleteProductReview(ownReview.id);
      setReviews((current) =>
        current.filter((review) => review.id !== ownReview.id),
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "No se pudo eliminar la reseña."),
      );
      throw requestError;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    reviews,
    ownReview,
    averageRating,
    isLoading,
    isSaving,
    error,
    saveReview,
    removeReview,
    refetch: loadReviews,
  };
};

export default useProductReviews;
