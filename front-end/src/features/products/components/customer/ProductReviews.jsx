import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../components/Button";
import EmptyState from "../../../../components/EmptyState";
import ErrorMessage from "../../../../components/ErrorMessage";
import H2 from "../../../../components/H2";
import LoadingState from "../../../../components/LoadingState";

const RatingStars = ({ rating, onChange, disabled = false }) => (
  <div className="flex items-center gap-1" role="group" aria-label="Puntuación">
    {[1, 2, 3, 4, 5].map((value) => (
      <button
        key={value}
        type="button"
        disabled={disabled || !onChange}
        onClick={() => onChange?.(value)}
        aria-label={`${value} de 5 estrellas`}
        className="rounded p-1 text-amber-500 disabled:cursor-default"
      >
        <Star
          className="h-5 w-5"
          fill={value <= rating ? "currentColor" : "none"}
        />
      </button>
    ))}
  </div>
);

const ProductReviewForm = ({ existingReview, onSave, onDelete, isSaving }) => {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    try {
      await onSave({ rating, comment });
    } catch {
      setFormError("Revisa el mensaje anterior e inténtalo nuevamente.");
    }
  };

  const handleDelete = async () => {
    setFormError("");
    try {
      await onDelete();
    } catch {
      setFormError("No se pudo eliminar la reseña.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-stone-900">
        {existingReview ? "Edita tu reseña" : "Escribe una reseña"}
      </h3>
      <p className="mt-1 text-sm text-stone-600">
        Solo pueden reseñar los clientes que tengan un pedido completado con este producto.
      </p>
      <div className="mt-4">
        <span className="mb-1 block text-sm font-medium text-stone-700">
          Tu puntuación
        </span>
        <RatingStars rating={rating} onChange={setRating} />
      </div>
      <label htmlFor="product-review-comment" className="mt-4 block text-sm font-medium text-stone-700">
        Comentario (opcional)
      </label>
      <textarea
        id="product-review-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={2000}
        rows={4}
        className="mt-1 w-full rounded-xl border border-stone-300 p-3 outline-none focus:border-golden focus:ring-2 focus:ring-golden/30"
        placeholder="Cuéntanos qué te pareció el producto"
      />
      <ErrorMessage message={formError} className="mt-3" />
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="submit" color="black" disabled={isSaving} className="p-2">
          {isSaving
            ? "Guardando..."
            : existingReview
              ? "Actualizar reseña"
              : "Publicar reseña"}
        </Button>
        {existingReview && (
          <Button
            type="button"
            color="white"
            disabled={isSaving}
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        )}
      </div>
    </form>
  );
};

const ProductReviews = ({
  productId,
  isAuthenticated,
  isCustomer,
  reviews,
  ownReview,
  averageRating,
  isLoading,
  isSaving,
  error,
  saveReview,
  removeReview,
}) => (
  <section className="px-5 pb-12 lg:px-12" aria-labelledby="product-reviews-heading">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div id="product-reviews-heading">
          <H2>Reseñas</H2>
        </div>
        <p className="mt-2 text-sm text-stone-600">
          {reviews.length
            ? `${averageRating.toFixed(1)} de 5 · ${reviews.length} ${reviews.length === 1 ? "reseña" : "reseñas"}`
            : "Este producto todavía no tiene reseñas."}
        </p>
      </div>
    </div>

    <ErrorMessage message={error} className="mb-4" />

    {isCustomer ? (
      <div className="mb-8">
        <ProductReviewForm
          key={ownReview?.id || `new-${productId}`}
          existingReview={ownReview}
          onSave={saveReview}
          onDelete={removeReview}
          isSaving={isSaving}
        />
      </div>
    ) : !isAuthenticated ? (
      <p className="mb-8 rounded-xl bg-stone-100 p-4 text-sm text-stone-700">
        <Link to="/login" className="font-semibold underline">
          Inicia sesión como cliente
        </Link>{" "}
        para escribir una reseña después de completar tu pedido.
      </p>
    ) : null}

    {isLoading ? (
      <LoadingState message="Cargando reseñas..." />
    ) : reviews.length === 0 ? (
      <EmptyState
        title="Aún no hay reseñas"
        description="Cuando un cliente con un pedido completado comparta su opinión, aparecerá aquí."
      />
    ) : (
      <div className="grid gap-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-stone-900">
                  {review.user_name || "Cliente"}
                  {review.is_mine && (
                    <span className="ml-2 text-xs font-normal text-stone-500">Tu reseña</span>
                  )}
                </h3>
                <time
                  className="text-xs text-stone-500"
                  dateTime={review.updated_at}
                >
                  {new Date(review.updated_at).toLocaleDateString()}
                </time>
              </div>
              <RatingStars rating={Number(review.rating)} />
            </div>
            {review.comment && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                {review.comment}
              </p>
            )}
          </article>
        ))}
      </div>
    )}
  </section>
);

export default ProductReviews;
