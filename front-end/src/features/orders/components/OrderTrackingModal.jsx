import {
  Check,
  CircleCheck,
  ClipboardList,
  Package,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useId, useRef } from "react";
import Button from "../../../components/Button";
import ErrorMessage from "../../../components/ErrorMessage";
import LoadingState from "../../../components/LoadingState";
import { getOrderStatusLabel } from "../constants/orderStatus";
import useOrderDetail from "../hooks/useOrderDetail";
import OrderStatusBadge from "./OrderStatusBadge";

const TRACKING_STEPS = [
  { status: "pending", icon: ClipboardList, description: "Tu pedido quedó registrado." },
  { status: "processing", icon: Package, description: "Preparamos los productos para el envío." },
  { status: "shipped", icon: Truck, description: "Tu pedido salió para entrega." },
  { status: "completed", icon: CircleCheck, description: "Confirmamos la entrega de tu pedido." },
];

const STEP_STYLES = {
  done: {
    icon: "bg-emerald-100",
    badge: "bg-emerald-50",
    text: "text-emerald-800",
    label: "Completado",
  },
  current: {
    icon: "bg-amber-100 ring-4 ring-amber-50/80",
    badge: "bg-amber-100",
    text: "text-amber-900",
    label: "Etapa actual",
  },
  upcoming: {
    icon: "bg-stone-100",
    badge: "bg-stone-100",
    text: "text-stone-600",
    label: "Pendiente",
  },
};

const OrderTrackingModal = ({ orderId, onClose }) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const { order, isLoading, error, refetch } = useOrderDetail(orderId);
  const currentStep = TRACKING_STEPS.findIndex((step) => step.status === order?.status);
  const isDelivered = order?.status === "completed";
  const isCancelled = order?.status === "cancelled";

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const closeTracking = () => {
    dialogRef.current.close();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        closeTracking();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[40rem] overflow-y-auto rounded-2xl bg-white text-stone-900 shadow-2xl backdrop:bg-stone-950/55 sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl"
    >
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-stone-200 bg-white px-5 py-5 sm:px-8 sm:py-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">
            Pedido #{orderId}
          </p>
          <h2 id={titleId} className="mt-2 font-display text-2xl leading-tight sm:text-4xl">
            Seguimiento del pedido
          </h2>
        </div>
        <button
          type="button"
          onClick={closeTracking}
          aria-label="Cerrar seguimiento"
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-amber-700"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="space-y-5 px-5 py-5 sm:space-y-7 sm:px-8 sm:py-7">
        {isLoading && <LoadingState message="Cargando seguimiento..." />}
        {!isLoading && error && (
          <>
            <ErrorMessage message={error} />
            <Button color="black" size="sm" onClick={refetch}>Reintentar</Button>
          </>
        )}

        {!isLoading && order && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 sm:px-5 sm:py-4">
              <span className="text-sm font-medium text-stone-700">Estado actual</span>
              <OrderStatusBadge status={order.status} />
            </div>

            {isCancelled && (
              <p className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-relaxed text-red-800 sm:p-5 sm:text-base">
                <XCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                El pedido fue cancelado y se detuvo su seguimiento.
              </p>
            )}

            {currentStep >= 0 && (
              <ol aria-label="Etapas del pedido">
                {TRACKING_STEPS.map(({ status, icon: Icon, description }, index) => {
                  const isCurrent = index === currentStep;
                  const isDone = isDelivered || index < currentStep;
                  const isActiveStep = isCurrent && !isDone;
                  const style = STEP_STYLES[isDone ? "done" : isCurrent ? "current" : "upcoming"];

                  return (
                    <li
                      key={status}
                      aria-current={isCurrent ? "step" : undefined}
                      className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 pb-3 last:pb-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4"
                    >
                      {index < TRACKING_STEPS.length - 1 && (
                        <span
                          aria-hidden="true"
                          className={`absolute top-10 bottom-0 left-5 w-0.5 -translate-x-1/2 sm:top-12 sm:left-6 ${
                            isDone ? "bg-emerald-200" : "bg-stone-200"
                          }`}
                        />
                      )}
                      <span className={`relative grid size-10 place-items-center rounded-full sm:size-12 ${style.icon} ${style.text}`}>
                        {isActiveStep && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-full motion-safe:border-2 motion-safe:border-amber-600 motion-safe:animate-[order-tracking-pulse_2s_ease-out_infinite]"
                          />
                        )}
                        <Icon className="size-5 sm:size-6" aria-hidden="true" />
                      </span>
                      <div
                        className={`min-w-0 rounded-2xl border px-3 py-3 sm:px-5 sm:py-4 ${
                          isActiveStep
                            ? "border-amber-200 bg-amber-50/70"
                            : "border-stone-100 bg-stone-50/60"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                          <h3 className="text-sm font-semibold sm:text-base">{getOrderStatusLabel(status)}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge} ${style.text}`}>
                            {isDone && <Check className="size-3.5" aria-hidden="true" />}
                            {style.label}
                          </span>
                        </div>
                        {(isDone || isCurrent) && (
                          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                            {description}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        )}
      </div>
    </dialog>
  );
};

export default OrderTrackingModal;
