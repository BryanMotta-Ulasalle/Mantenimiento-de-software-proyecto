import { getOrderStatusLabel } from "../constants/orderStatus";

const STATUS_CLASS_NAMES = {
  pending: "bg-amber-50 text-amber-800",
  processing: "bg-blue-50 text-blue-800",
  completed: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-red-50 text-red-800",
};

const OrderStatusBadge = ({ status, className = "" }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      STATUS_CLASS_NAMES[status] || "bg-stone-100 text-stone-700"
    } ${className}`}
  >
    {getOrderStatusLabel(status)}
  </span>
);

export default OrderStatusBadge;
