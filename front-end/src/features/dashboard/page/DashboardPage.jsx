import {
  Boxes,
  ChartColumnStacked,
  ShoppingCart,
  TriangleAlert,
  Users,
  WalletCards,
} from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import ErrorMessage from "../../../components/ErrorMessage";
import H2 from "../../../components/H2";
import LoadingState from "../../../components/LoadingState";
import TablePrivate from "../../products/components/staff/TablePrivate";
import { formatProductPrice } from "../../products/utils/productFormatters";
import MetricCard from "../components/MetricCard";
import ExportReportButton from "../components/ExportReportButton";
import OrdersByMonthChart from "../components/OrdersByMonthChart";
import ProductsByCategoryChart from "../components/ProductsByCategoryChart";
import useDashboardAdmin from "../hooks/useDashboardAdmin";

const DashboardPage = () => {
  const { data, isLoading, error } = useDashboardAdmin();

  if (isLoading) {
    return <LoadingState message="Cargando dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} className="m-5" />;
  }

  const { summary, orders_by_month, products_by_category, recent_orders } = data;
  const columns = [
    {
      key: "id",
      label: "Orden",
      render: (value) => <span className="font-semibold">#{value}</span>,
    },
    {
      key: "user_name",
      label: "Cliente",
      render: (value) => value || "Usuario no disponible",
    },
    {
      key: "created_at",
      label: "Fecha",
      render: (value) =>
        value
          ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(
              new Date(value),
            )
          : "No disponible",
    },
    {
      key: "status",
      label: "Estado",
      render: (value) => (
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-800">
          {value}
        </span>
      ),
    },
    {
      key: "total_price",
      label: "Total",
      render: (value) => (
        <span className="font-bold">{formatProductPrice(value)}</span>
      ),
    },
    {
      key: "shipping_address",
      label: "Direccion",
      render: (value) => (
        <span className="block max-w-64 text-sm text-stone-600">{value}</span>
      ),
    },
  ];

  const metrics = [
    {
      label: "Productos",
      value: summary.products,
      detail: "Productos registrados",
      icon: Boxes,
    },
    {
      label: "Stock bajo",
      value: summary.low_stock_products,
      detail: `${summary.low_stock_threshold} unidades o menos`,
      icon: TriangleAlert,
    },
    {
      label: "Categorias",
      value: summary.categories,
      detail: "Categorias registradas",
      icon: ChartColumnStacked,
    },
    {
      label: "Ordenes",
      value: summary.orders,
      detail: "Ordenes registradas",
      icon: ShoppingCart,
    },
    {
      label: "Monto de pedidos",
      value: formatProductPrice(summary.order_amount),
      detail: "No equivale a pagos confirmados",
      icon: WalletCards,
    },
    {
      label: "Usuarios",
      value: summary.users,
      detail: "Cuentas registradas",
      icon: Users,
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
        <H2>Dashboard</H2>
        <p className="mt-1 text-sm text-stone-500">
          Resumen administrativo calculado desde datos agregados del sistema.
        </p>
        </div>
        <ExportReportButton dashboardData={data} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-stone-900">Estadísticas</h2>
        <div className="mt-4 grid gap-6 xl:grid-cols-2">
          <OrdersByMonthChart data={orders_by_month} />
          <ProductsByCategoryChart data={products_by_category} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-stone-900">
          Ordenes recientes
        </h2>
        <div className="mt-4">
          {recent_orders.length === 0 ? (
            <EmptyState
              title="No hay ordenes recientes"
              description="Las nuevas ordenes apareceran en este resumen."
            />
          ) : (
            <TablePrivate columns={columns} data={recent_orders} />
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
