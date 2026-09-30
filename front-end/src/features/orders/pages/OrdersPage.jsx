import { Eye } from "lucide-react";
import { useState } from "react";
import EmptyState from "../../../components/EmptyState";
import ErrorMessage from "../../../components/ErrorMessage";
import H2 from "../../../components/H2";
import LoadingState from "../../../components/LoadingState";
import TablePrivate from "../../products/components/staff/TablePrivate";
import { formatProductPrice } from "../../products/utils/productFormatters";
import useUsersAdmin from "../../users/hooks/useUsersAdmin";
import OrderDetailModal from "../components/OrderDetailModal";
import useOrders from "../hooks/useOrders";

const OrdersPage = () => {
  const { orders, isLoading, error } = useOrders();
  const {
    users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsersAdmin();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const usersById = new Map(users.map((user) => [user.id, user]));

  const getCustomerName = (userId) => {
    const user = usersById.get(userId);
    return user ? `${user.name} (${user.email})` : `Usuario #${userId}`;
  };

  const columns = [
    {
      key: "id",
      label: "Orden",
      render: (value) => <span className="font-semibold">#{value}</span>,
    },
    {
      key: "user",
      label: "Cliente",
      render: (value) => (
        <span className="text-sm">{getCustomerName(value)}</span>
      ),
    },
    {
      key: "created_at",
      label: "Fecha",
      render: () => (
        <span className="text-sm text-stone-400">No disponible</span>
      ),
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
        <span className="block max-w-60 text-sm text-stone-600">{value}</span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_, order) => (
        <button
          type="button"
          onClick={() => setSelectedOrder(order)}
          className="cursor-pointer rounded-lg p-2 text-blue-700 hover:bg-blue-50"
          aria-label={`Ver orden ${order.id}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (isLoading || usersLoading) {
    return <LoadingState message="Cargando ordenes..." />;
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10">
      <div>
        <H2>Ordenes</H2>
        <p className="mt-1 text-sm text-stone-500">
          Consulta pedidos y sus items. El estado es de solo lectura.
        </p>
      </div>
      <ErrorMessage message={error || usersError} />
      {orders.length === 0 ? (
        <EmptyState
          title="No hay ordenes"
          description="Las compras confirmadas apareceran aqui."
        />
      ) : (
        <TablePrivate columns={columns} data={orders} />
      )}

      {selectedOrder && (
        <OrderDetailModal
          orderId={selectedOrder.id}
          customerName={getCustomerName(selectedOrder.user)}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
};

export default OrdersPage;
