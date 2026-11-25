import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/client";
import { getApiErrorMessage } from "../../../api/errors";
import ErrorMessage from "../../../components/ErrorMessage";
import { formatOrderDate } from "../utils/orderFormatters";
const OrderNotifications = ({
  className = ""
}) => {
  const [data, setData] = useState({
    results: [],
    unread_count: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const panel = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    let busy = false;
    const load = async () => {
      if (document.hidden || busy) return;
      busy = true;
      try {
        const {
          data: notifications
        } = await apiClient.get("/notifications/", {
          withAuth: true
        });
        if (active) {
          setData(notifications);
          setError("");
        }
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError));
      } finally {
        busy = false;
      }
    };
    load();
    const timer = setInterval(load, 30000);
    document.addEventListener("visibilitychange", load);
    window.addEventListener("focus", load);
    const dismiss = event => {
      if (!panel.current?.contains(event.target) || event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
      window.removeEventListener("focus", load);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, [isOpen]);
  const read = async notification => {
    setIsSaving(true);
    try {
      await apiClient.post(`/notifications/${notification.id}/read/`, null, {
        withAuth: true
      });
      setData(current => ({
        unread_count: Math.max(0, current.unread_count - (notification.is_read ? 0 : 1)),
        results: current.results.map(item => item.id === notification.id ? {
          ...item,
          is_read: true
        } : item)
      }));
      setIsOpen(false);
      navigate("/cuenta/ordenes", {
        state: {
          trackingOrderId: notification.order_id
        }
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };
  const readAll = async () => {
    setIsSaving(true);
    try {
      await apiClient.post("/notifications/read-all/", null, {
        withAuth: true
      });
      setData(current => ({
        unread_count: 0,
        results: current.results.map(item => ({
          ...item,
          is_read: true
        }))
      }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };
  return <div ref={panel} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`Notificaciones, ${data.unread_count} sin leer`}
        onClick={() => setIsOpen(open => !open)}
        className={`relative grid size-11 place-items-center rounded-xl hover:bg-golden/10 ${className}`}
      >
        <Bell className="size-5" aria-hidden="true" />
        {data.unread_count > 0 && <span className="absolute right-0 top-0 rounded-full bg-red-700 px-1.5 text-xs font-bold text-white">{data.unread_count > 99 ? "99+" : data.unread_count}</span>}
      </button>
      {isOpen && <section
        aria-label="Notificaciones de pedidos"
        className="absolute right-0 top-13 z-110 max-h-[70dvh] w-[min(20rem,85vw)] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 text-stone-900 shadow-xl max-sm:fixed max-sm:right-3 max-sm:top-17"
      >
          <h2 className="text-lg font-semibold">Tus notificaciones</h2>
          <ErrorMessage message={error} className="mt-2" />
          {data.unread_count > 0 && <button
            type="button"
            disabled={isSaving}
            onClick={readAll}
            className="my-3 flex items-center gap-2 text-sm font-medium text-amber-900 disabled:opacity-50"
          ><CheckCheck className="size-4" />Marcar todas como leídas</button>}
          {data.results.length === 0 && <p className="mt-3 text-sm text-stone-600">Aún no tienes notificaciones.</p>}
          <ul className="mt-2 space-y-2">
            {data.results.map(item => <li key={item.id}><button
              type="button"
              disabled={isSaving}
              onClick={() => read(item)}
              className={`w-full rounded-xl p-3 text-left disabled:opacity-50 ${item.is_read ? "bg-stone-50" : "bg-amber-50"}`}
            >
              <span className="block text-sm font-semibold">Pedido #{item.order_id} · {item.status_label}</span>
              <span className="mt-1 block text-xs text-stone-600">{formatOrderDate(item.created_at)}{!item.is_read && " · Sin leer"}</span>
            </button></li>)}
          </ul>
        </section>}
    </div>;
};
export default OrderNotifications;
