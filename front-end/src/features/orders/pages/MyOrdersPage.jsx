import { useLocation } from "react-router-dom";
import EmptyState from "../../../components/EmptyState";
import ErrorMessage from "../../../components/ErrorMessage";
import H2 from "../../../components/H2";
import LoadingState from "../../../components/LoadingState";
import { formatProductPrice } from "../../products/utils/productFormatters";
import useOrders from "../hooks/useOrders";

const formatOrderDate = (date) => {
  if (!date) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const MyOrdersPage = () => {
  const location = useLocation();
  const { orders, isLoading, error } = useOrders();
  const createdOrderId = location.state?.createdOrderId;

  if (isLoading) {
    return <LoadingState message="Cargando tus ordenes..." />;
  }

  if (error) {
    return <ErrorMessage message={error} className="m-5" />;
  }

  return (
    <section className="px-5 py-10 lg:px-10">
      <H2>Mis Ordenes</H2>

      {createdOrderId && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
          La orden #{createdOrderId} fue creada correctamente.
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="Todavia no tienes ordenes"
          description="Cuando finalices una compra, aparecera aqui."
        />
      ) : (
        <div className="mt-8 grid gap-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Orden #{order.id}</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Envio: {order.shipping_address}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatOrderDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium capitalize text-amber-800">
                    {order.status}
                  </span>
                  <p className="mt-3 text-xl font-bold">
                    {formatProductPrice(order.total_price)}
                  </p>
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="mt-5 border-t border-stone-200 pt-4">
                  <p className="mb-2 text-sm font-semibold text-stone-700">
                    Productos
                  </p>
                  <ul className="space-y-1 text-sm text-stone-600">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        Producto #{item.product}: {item.quantity} x{" "}
                        {formatProductPrice(item.unit_price)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyOrdersPage;
