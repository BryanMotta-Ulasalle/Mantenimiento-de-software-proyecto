const EmptyState = ({
  title = "No hay resultados",
  description = "Todavia no hay informacion para mostrar.",
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center ${className}`}
    >
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default EmptyState;
