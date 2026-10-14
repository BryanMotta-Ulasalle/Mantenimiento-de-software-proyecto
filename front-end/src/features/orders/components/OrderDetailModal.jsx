import { useState } from "react";
import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import LoadingState from "../../../components/LoadingState";
import Modal from "../../../components/Modal";
import { formatProductPrice } from "../../products/utils/productFormatters";
import OrderStatusBadge from "./OrderStatusBadge";
import {
  getAvailableOrderStatuses,
  getOrderStatusLabel,
  isFinalOrderStatus,
} from "../constants/orderStatus";
import useOrderDetail from "../hooks/useOrderDetail";
import useUpdateOrderStatus from "../hooks/useUpdateOrderStatus";
import { formatOrderDate } from "../utils/orderFormatters";

const OrderDetailModal = ({
  orderId,
  customerName,
  onClose,
  canEditStatus = false,
  onStatusUpdated,
}) => {
  const { order, isLoading, error, refetch } = useOrderDetail(orderId);
  const {
    updateStatus,
    isLoading: isUpdatingStatus,
    error: updateStatusError,
  } = useUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState("");
  const availableStatuses = getAvailableOrderStatuses(order?.status);
  const statusToSave = availableStatuses.includes(selectedStatus)
    ? selectedStatus
    : order?.status;
  const isFinalStatus = isFinalOrderStatus(order?.status);
  const hasStatusChange = statusToSave && statusToSave !== order?.status;

  const handleStatusUpdate = async () => {
    try {
      await updateStatus(order.id, statusToSave);
      onStatusUpdated?.();
      refetch();
    } catch {
      refetch();
    }
  };

  return (
    <Modal title={`Detalle de orden #${orderId}`} onClose={onClose}>
      {isLoading && !order && <LoadingState message="Cargando detalle..." />}
      {error && <ErrorMessage message={error} />}

      {order && (
        <div className="flex flex-col gap-6">
          <dl className="grid gap-4 rounded-xl bg-stone-50 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-stone-500">
                Cliente
              </dt>
              <dd className="mt-1 font-medium">{customerName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-stone-500">
                Estado
              </dt>
              <dd className="mt-1">
                <OrderStatusBadge status={order.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-stone-500">
                Fecha del pedido
              </dt>
              <dd className="mt-1">{formatOrderDate(order.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-stone-500">
                Direccion
              </dt>
              <dd className="mt-1">{order.shipping_address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-stone-500">
                Total
              </dt>
              <dd className="mt-1 text-lg font-bold">
                {formatProductPrice(order.total_price)}
              </dd>
            </div>
          </dl>

          {canEditStatus && (
            <section className="rounded-xl border border-stone-200 p-4">
              <h3 className="font-semibold text-stone-900">Estado del pedido</h3>
              {isFinalStatus ? (
                <p className="mt-2 text-sm text-stone-600">
                  {getOrderStatusLabel(order.status)} es un estado final.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-stone-700">
                    Nuevo estado
                    <select
                      value={statusToSave}
                      onChange={(event) => setSelectedStatus(event.target.value)}
                      disabled={isUpdatingStatus}
                      className="rounded-xl border border-stone-200 bg-white px-3 py-2 font-normal disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {availableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {getOrderStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    color="black"
                    size="sm"
                    disabled={isUpdatingStatus || isLoading || !hasStatusChange}
                    onClick={handleStatusUpdate}
                  >
                    {isUpdatingStatus ? "Guardando..." : "Guardar estado"}
                  </Button>
                </div>
              )}
              <ErrorMessage className="mt-3" message={updateStatusError} />
            </section>
          )}

          <div>
            <h3 className="font-semibold text-stone-900">Items</h3>
            {order.items?.length ? (
              <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full min-w-120">
                  <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Cantidad</th>
                      <th className="px-4 py-3">Precio unitario</th>
                      <th className="px-4 py-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t border-stone-100">
                        <td className="px-4 py-3">#{item.product}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">
                          {formatProductPrice(item.unit_price)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatProductPrice(
                            Number(item.unit_price) * Number(item.quantity),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-sm text-stone-500">
                La API no devolvio items para esta orden.
              </p>
            )}
          </div>

          
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
