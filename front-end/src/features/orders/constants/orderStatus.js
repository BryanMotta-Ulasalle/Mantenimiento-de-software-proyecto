export const ORDER_STATUS_LABELS = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const getOrderStatusLabel = (status) =>
  ORDER_STATUS_LABELS[status] || "Estado no disponible";

export const getAvailableOrderStatuses = (status) => [
  status,
  ...(ORDER_STATUS_TRANSITIONS[status] || []),
];

export const isFinalOrderStatus = (status) =>
  (ORDER_STATUS_TRANSITIONS[status] || []).length === 0;
