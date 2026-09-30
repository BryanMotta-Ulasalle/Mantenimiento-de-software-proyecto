import ErrorMessage from "../../../components/ErrorMessage";
import LoadingState from "../../../components/LoadingState";
import Modal from "../../../components/Modal";
import { formatProductPrice } from "../../products/utils/productFormatters";
import useOrderDetail from "../hooks/useOrderDetail";

const OrderDetailModal = ({ orderId, customerName, onClose }) => {
  const { order, isLoading, error } = useOrderDetail(orderId);

  return (
    <Modal title={`Detalle de orden #${orderId}`} onClose={onClose}>
      {isLoading && <LoadingState message="Cargando detalle..." />}
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
              <dd className="mt-1 capitalize">{order.status}</dd>
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
