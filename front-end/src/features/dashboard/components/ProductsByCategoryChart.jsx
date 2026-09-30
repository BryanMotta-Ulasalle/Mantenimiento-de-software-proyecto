import EmptyState from "../../../components/EmptyState";

const ProductsByCategoryChart = ({ data }) => {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No hay categorías con productos"
        description="La distribución aparecerá aquí cuando se registren productos."
      />
    );
  }

  const maximumCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-stone-900">
          Productos por categoría
        </h3>
        <p className="mt-1 text-sm text-stone-500">
          Incluye todos los productos registrados, activos e inactivos.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {data.map((item) => {
          const percentage = (item.count / maximumCount) * 100;
          const tooltip = `${item.category}: ${item.count} productos`;

          return (
            <div key={item.category} title={tooltip}>
              <div className="mb-2 flex justify-between gap-4 text-sm">
                <span className="truncate font-medium text-stone-700">
                  {item.category}
                </span>
                <span className="shrink-0 text-stone-500">
                  {item.count} productos
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-sky-600 transition-[width]"
                  style={{ width: `${percentage}%` }}
                  aria-label={tooltip}
                  role="img"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsByCategoryChart;
