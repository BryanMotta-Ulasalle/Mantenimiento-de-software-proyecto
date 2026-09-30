import EmptyState from "../../../components/EmptyState";
import { formatProductPrice } from "../../products/utils/productFormatters";

const OrdersByMonthChart = ({ data }) => {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No hay pedidos registrados"
        description="Los montos de pedidos aparecerán aquí cuando existan órdenes."
      />
    );
  }

  const maximumTotal = Math.max(...data.map((item) => Number(item.total)), 1);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">
            Monto de pedidos por mes
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            Pedidos creados; no equivale a pagos confirmados.
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs text-stone-500">
          <span className="h-3 w-3 rounded-sm bg-golden" /> Monto acumulado
        </span>
      </div>

      <div className="mt-8 flex h-64 items-end gap-3 overflow-x-auto border-b border-l border-stone-200 px-4 pt-4">
        {data.map((item) => {
          const percentage = (Number(item.total) / maximumTotal) * 100;
          const tooltip = `${item.label}: ${formatProductPrice(item.total)}`;

          return (
            <div
              key={item.month}
              className="flex min-w-16 flex-1 flex-col items-center justify-end gap-2"
              title={tooltip}
            >
              <span className="text-xs font-medium text-stone-600">
                {formatProductPrice(item.total)}
              </span>
              <div
                className="w-full min-h-1 rounded-t-lg bg-golden transition-opacity hover:opacity-80"
                style={{ height: `${percentage}%` }}
                aria-label={tooltip}
                role="img"
              />
              <span className="text-xs text-stone-500">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersByMonthChart;
