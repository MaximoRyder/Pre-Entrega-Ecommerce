import {
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { ToastContext } from "../context/ToastContext";
import { formatCurrency, formatOrderDate } from "../utils/format";
import OrderEditor from "./OrderEditor";

const API =
  import.meta.env.VITE_ORDERS_API ||
  "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/orders";

const AdminOrders = () => {
  const toastCtx = useContext(ToastContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [restoreOrder, setRestoreOrder] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    (async function load() {
      setLoading(true);
      try {
        if (!import.meta.env.VITE_ORDERS_API) {
          const local = JSON.parse(
            localStorage.getItem("local_orders") || "[]"
          );
          setOrders(local || []);
        } else {
          const res = await fetch(API);
          if (!res.ok) throw new Error("No se pudieron cargar los pedidos");
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("No se pudieron cargar los pedidos");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function deleteOrder(id) {
    try {
      if (!import.meta.env.VITE_ORDERS_API || String(id).startsWith("local-")) {
        const local = JSON.parse(localStorage.getItem("local_orders") || "[]");
        const next = (local || []).filter((o) => o.id !== id);
        localStorage.setItem("local_orders", JSON.stringify(next));
        setOrders((prev) => prev.filter((o) => o.id !== id));
        toastCtx.showToast("Pedido eliminado localmente", 1500, "info");
        return;
      }
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando pedido");
      await refresh();
      toastCtx.showToast("Pedido eliminado", 1500, "success");
    } catch (err) {
      console.error("deleteOrder", err);
      toastCtx.showToast(
        err.message || "Error eliminando pedido",
        2200,
        "error"
      );
      throw err;
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={refresh}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm whitespace-nowrap"
            title="Refrescar lista"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refrescar
          </button>
          <button
            onClick={() => setCreating(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 text-white px-3 py-2 text-sm whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4" />
            Agregar pedido
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-md overflow-hidden">
        {/* Desktop table */}
        <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm hidden md:block">
          {loading ? (
            <div className="p-6 text-center text-sub">Cargando pedidos...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-sub">No hay pedidos</div>
          ) : (
            <table className="w-full text-xs sm:text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wide text-sub border-b border-border">
                  <th className="px-2 py-1.5 sm:px-3 sm:py-2">ID</th>
                  <th className="px-2 py-1.5 sm:px-3 sm:py-2">Usuario</th>
                  <th className="px-2 py-1.5 sm:px-3 sm:py-2">Fecha</th>
                  <th className="px-2 py-1.5 sm:px-3 sm:py-2">Items</th>
                  <th className="px-2 py-1.5 sm:px-3 sm:py-2">Subtotal</th>
                  <th className="px-2 py-1.5 sm:px-3 sm:py-2">Estado</th>
                  <th className="px-2 py-1.5 sm:px-3 sm:py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const itemCount = o.items?.reduce(
                    (s, it) => s + (Number(it.quantity) || 0),
                    0
                  );
                  return (
                    <tr key={o.id} className="align-top border-b border-border">
                      <td className="px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm font-medium">
                        #{o.id}
                      </td>
                      <td
                        className="px-2 py-1.5 sm:px-3 sm:py-2 max-w-[180px]"
                        title={o.userEmail}
                      >
                        <div className="flex flex-col">
                          <span className="truncate">{o.userEmail || "-"}</span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-sub whitespace-nowrap">
                        {formatOrderDate(o.createdAt)}
                      </td>
                      <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                        {itemCount || 0}
                      </td>
                      <td className="px-2 py-1.5 sm:px-3 sm:py-2 font-medium">
                        {formatCurrency(o.subtotal)}
                      </td>
                      <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                        <span
                          className={
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold " +
                            (o.status === "Pending"
                              ? "bg-yellow-900/20 text-yellow-500"
                              : o.status === "Processing"
                              ? "bg-blue-900/20 text-blue-500"
                              : o.status === "Shipped"
                              ? "bg-green-900/20 text-green-500"
                              : o.status === "Rejected"
                              ? "bg-red-900/20 text-red-500"
                              : "bg-surface-hover text-sub")
                          }
                        >
                          {o.status || "-"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditing(o)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-surface-hover text-sub"
                            aria-label="Editar"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(o)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-red-300 hover:bg-red-900/20 text-red-500"
                            aria-label="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-3">
          {loading ? (
            <div className="text-center text-sub py-6">Cargando pedidos...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-6">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-sub py-6">No hay pedidos</div>
          ) : (
            orders.map((o) => {
              const itemCount = o.items?.reduce(
                (s, it) => s + (Number(it.quantity) || 0),
                0
              );
              const isExpanded = !!expanded[o.id];
              return (
                <div
                  key={o.id}
                  className="border border-border rounded-md bg-surface shadow-sm px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">ID:</span>
                      <span>#{o.id}</span>
                    </div>
                    <span
                      className={
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold " +
                        (o.status === "Pending"
                          ? "bg-yellow-900/20 text-yellow-500"
                          : o.status === "Processing"
                          ? "bg-blue-900/20 text-blue-500"
                          : o.status === "Shipped"
                          ? "bg-green-900/20 text-green-500"
                          : o.status === "Rejected"
                          ? "bg-red-900/20 text-red-500"
                          : "bg-surface-hover text-sub")
                      }
                    >
                      {o.status || "-"}
                    </span>
                  </div>

                  <div className="border-t border-border mt-2 pt-1 flex flex-col gap-2">
                    <div className="flex">
                      <span className="font-semibold mr-1">Usuario:</span>
                      <span className="flex-1 truncate" title={o.userEmail}>
                        {o.userEmail || "-"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold mr-1">Fecha:</span>
                      <span className="flex-1">
                        {formatOrderDate(o.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Items:</span>
                        <span>{itemCount || 0}</span>
                      </div>
                      {o.items && o.items.length > 0 && (
                        <button
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [o.id]: !prev[o.id],
                            }))
                          }
                          className="text-xs font-medium px-2 py-1 rounded-md border border-border hover:bg-surface-hover"
                        >
                          {isExpanded ? "Ocultar" : "Ver"}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && o.items && o.items.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-main">
                      {o.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between gap-2">
                          <span className="truncate" title={it.name}>
                            {it.name}
                          </span>
                          <span className="whitespace-nowrap">
                            x{it.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="border-t border-border mt-2 pt-2 flex items-center gap-2">
                    <span className="font-semibold">Acciones:</span>
                    <button
                      onClick={() => setEditing(o)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-surface-hover text-sub"
                      aria-label="Editar"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(o)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-red-300 hover:bg-red-900/20 text-red-500"
                      aria-label="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <OrderEditor
        editing={editing}
        setEditing={setEditing}
        creating={creating}
        setCreating={setCreating}
        restoreOrder={restoreOrder}
        setRestoreOrder={setRestoreOrder}
        toDelete={toDelete}
        setToDelete={setToDelete}
        refresh={refresh}
        deleteOrder={deleteOrder}
        setOrders={setOrders}
      />
    </div>
  );
};

export default AdminOrders;
