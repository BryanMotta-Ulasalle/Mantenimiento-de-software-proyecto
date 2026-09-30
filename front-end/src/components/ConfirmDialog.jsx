import Button from "./Button";
import ErrorMessage from "./ErrorMessage";

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onCancel,
  isLoading = false,
  error,
}) => {
  return (
    <div
      className="fixed inset-0 z-210 flex items-center justify-center bg-black/50 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
        <p className="mt-2 leading-6 text-stone-600">{message}</p>
        <ErrorMessage message={error} className="mt-4" />
        <div className="mt-6 flex justify-end gap-3">
          <Button
            className="border border-stone-300"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Eliminando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
