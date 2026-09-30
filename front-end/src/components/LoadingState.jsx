const LoadingState = ({ message = "Cargando..." }) => {
  return (
    <div
      className="flex min-h-32 items-center justify-center gap-3 text-gray-600"
      role="status"
      aria-live="polite"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-golden" />
      <span>{message}</span>
    </div>
  );
};

export default LoadingState;
