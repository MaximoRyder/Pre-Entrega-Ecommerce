import {
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";
import { formatCurrency, formatNumber, formatOrderDate } from "../utils/format";
import AdminEntityModal from "./AdminEntityModal";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";

const API =
  import.meta.env.VITE_ORDERS_API ||
  "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/orders";

const statusOptions = ["Pending", "Rejected", "Processing", "Shipped"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [statusForm, setStatusForm] = useState("Pending");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 10;
  async function updateQuantityWithRetry(url, newQuantity, attempts = 3) {
    let lastErr = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const getRes = await fetch(url);
        if (!getRes.ok) throw new Error(`GET status ${getRes.status}`);
        const prod = await getRes.json();
        prod.quantity = newQuantity;
        const putRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prod),
        });
        if (!putRes.ok) {
          const text = await putRes.text().catch(() => null);
          throw new Error(`PUT status ${putRes.status} ${text || ""}`);
        }
        return putRes;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 300 * Math.pow(2, i)));
      }
    }
    throw lastErr;
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Error al obtener pedidos");
        const data = await res.json();
        const local = JSON.parse(localStorage.getItem("local_orders") || "[]");
        const combined = [...(local || []), ...(data || [])];
        if (mounted) setOrders(combined.reverse());
      } catch (err) {
        if (mounted) setError(err.message || "Error desconocido");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const syncLocalOrders = async () => {
    const local = JSON.parse(localStorage.getItem("local_orders") || "[]");
    if (!local || local.length === 0) {
      setError(null);
      return;
    }
    if (!import.meta.env.VITE_ORDERS_API) {
      setError(
        "No VITE_ORDERS_API definido — configura la variable de entorno con la URL del proyecto MockAPI para orders."
      );
      return;
    }
    const PRODUCTS_API =
      import.meta.env.VITE_PRODUCTS_API ||
      "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";
    setLoading(true);
    try {
      let allOk = true;
      for (const o of local) {
        const payload = { ...o };
        delete payload.id;
        delete payload.local;
        payload.createdAt = payload.createdAt || new Date().toISOString();
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(`Sync failed: ${res.status} ${text || ""}`);
        }
        await res.json();

        for (const it of payload.items || []) {
          try {
            const prodRes = await fetch(`${PRODUCTS_API}/${it.id}`);
            if (!prodRes.ok) {
              console.warn(
                `No se pudo cargar producto ${it.id} para actualizar stock`
              );
              allOk = false;
              continue;
            }
            const prod = await prodRes.json();
            const available = Number(
              prod.quantity ?? prod.stock ?? prod.rating?.count ?? 0
            );
            const newCount = Math.max(0, available - Number(it.quantity || 0));
            await updateQuantityWithRetry(`${PRODUCTS_API}/${it.id}`, newCount);
          } catch (uerr) {
            console.error("Error actualizando stock al sincronizar:", uerr);
            allOk = false;
          }
        }
      }
      if (allOk) {
        localStorage.removeItem("local_orders");
      } else {
        setError(
          "Algunos stocks no se pudieron actualizar. Reintenta sincronizar desde Admin."
        );
      }
      await refresh();
    } catch (err) {
      console.error("Error sincronizando pedidos locales:", err);
      setError(err.message || "Error sincronizando pedidos locales");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      const local = JSON.parse(localStorage.getItem("local_orders") || "[]");
      setOrders([...(local || []), ...(data || [])].reverse());
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (String(id).startsWith("local-")) {
        const local = JSON.parse(localStorage.getItem("local_orders") || "[]");
        const idx = local.findIndex((o) => o.id === id);
        if (idx !== -1) {
          local[idx].status = status;
          localStorage.setItem("local_orders", JSON.stringify(local));
          setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status } : o))
          );
          return;
        }
      }
      const getRes = await fetch(`${API}/${id}`);
      if (!getRes.ok) throw new Error("Error leyendo pedido para actualizar");
      const current = await getRes.json();
      const payload = { ...current, status };
      const putRes = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!putRes.ok) throw new Error("Error al actualizar");
      await refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error desconocido");
    }
  };

  const deleteOrder = async (id) => {
    try {
      if (String(id).startsWith("local-")) {
        const local = JSON.parse(localStorage.getItem("local_orders") || "[]");
        const remaining = local.filter((o) => o.id !== id);
        localStorage.setItem("local_orders", JSON.stringify(remaining));
        setOrders((prev) => prev.filter((o) => o.id !== id));
        return;
      }
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      await refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error desconocido");
    }
  };

  if (loading)
    return (
      <p className="px-4 py-6 text-sm text-gray-600">Cargando pedidos...</p>
    );
  if (error)
    return <p className="px-4 py-6 text-sm text-red-600">Error: {error}</p>;

  const localCount = (
    JSON.parse(localStorage.getItem("local_orders") || "[]") || []
  ).length;

  return (
    <div className="space-y-6">
      <div className="hidden md:flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight">Pedidos</h3>
        <div className="flex items-center gap-2">
          {localCount > 0 && (
            <button
              onClick={syncLocalOrders}
              className="inline-flex items-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-2 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
            >
              <ArrowPathIcon className="w-5 h-5" /> Sincronizar ({localCount})
            </button>
          )}
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
          >
            <ArrowPathIcon className="w-5 h-5" /> Refrescar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm hidden md:block">
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
            {orders.slice((page - 1) * pageSize, page * pageSize).map((o) => {
              const itemCount = o.items?.reduce(
                (s, it) => s + (Number(it.quantity) || 0),
                0
              );
              const isExp = expanded[o.id];
              return (
                <Fragment key={o.id}>
                  <tr
                    className={
                      "align-top border-b border-border " +
                      (isExp ? "" : "last:border-b-0")
                    }
                  >
                    <td className="px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span>#{o.id}</span>
                        {o.local && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-900/20 text-amber-500 text-[10px] font-medium">
                            Local
                          </span>
                        )}
                        {o.syncError && (
                          <span className="px-2 py-0.5 rounded-full bg-red-900/20 text-red-500 text-[10px] font-medium">
                            Sync
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-2 py-1.5 sm:px-3 sm:py-2 max-w-[180px]"
                      title={o.userEmail}
                    >
                      <div className="flex flex-col">
                        <span className="truncate">{o.userEmail || "-"}</span>
                        {o.items && o.items.length > 0 && (
                          <button
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [o.id]: !prev[o.id],
                              }))
                            }
                            className="mt-1 text-[11px] text-primary-500 hover:underline text-left"
                          >
                            {isExp ? "Ocultar items" : "Ver items"}
                          </button>
                        )}
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
                          onClick={() => {
                            setEditing(o);
                            setStatusForm(o.status || "pending");
                          }}
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
                  {isExp && o.items && o.items.length > 0 && (
                    <tr className="border-b last:border-b-0 border-border">
                      <td colSpan={7} className="px-3 py-2 bg-surface-hover">
                        <ul className="space-y-1 text-xs text-main">
                          {o.items.map((it, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="truncate" title={it.name}>
                                {it.name}
                              </span>
                              <span className="shrink-0">
                                x
                                {formatNumber(it.quantity, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-xs text-sub"
                >
                  No hay pedidos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="hidden md:block mt-3">
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(orders.length / pageSize))}
          onPageChange={setPage}
        />
      </div>

      {/* Vista móvil tipo tarjeta/lista */}
      <div className="md:hidden space-y-3">
        {orders.slice((page - 1) * pageSize, page * pageSize).map((o) => {
          const itemCount = o.items?.reduce(
            (s, it) => s + (Number(it.quantity) || 0),
            0
          );
          const isExpanded = expanded[o.id];
          return (
            <div
              key={o.id}
              className="border border-border rounded-md bg-surface shadow-sm px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">ID:</span>
                  <span>#{o.id}</span>
                  {o.local && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-900/20 text-amber-500 text-[10px] font-medium">
                      Local
                    </span>
                  )}
                  {o.syncError && (
                    <span className="px-2 py-0.5 rounded-full bg-red-900/20 text-red-500 text-[10px] font-medium">
                      Sync
                    </span>
                  )}
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
              <div className="border-t border-border mt-2 pt-1 flex">
                <span className="font-semibold mr-1">Usuario:</span>
                <span className="flex-1 truncate" title={o.userEmail}>
                  {o.userEmail || "-"}
                </span>
              </div>
              <div className="border-t border-border pt-1 flex">
                <span className="font-semibold mr-1">Fecha:</span>
                <span className="flex-1">{formatOrderDate(o.createdAt)}</span>
              </div>
              <div className="border-t border-border pt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Items:</span>
                  <span>{itemCount || 0}</span>
                </div>
                {o.items && o.items.length > 0 && (
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [o.id]: !prev[o.id] }))
                    }
                    className="text-xs font-medium px-2 py-1 rounded-md border border-border hover:bg-surface-hover"
                  >
                    {isExpanded ? "Ocultar" : "Ver"}
                  </button>
                )}
              </div>
              {isExpanded && o.items && o.items.length > 0 && (
                <ul className="mt-1 space-y-1 text-xs text-sub">
                  {o.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between gap-2">
                      <span className="truncate" title={it.name}>
                        {it.name}
                      </span>
                      <span className="whitespace-nowrap">
                        x
                        {formatNumber(it.quantity, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t border-border pt-1 mt-1 flex">
                <span className="font-semibold mr-1">Subtotal:</span>
                <span className="flex-1">{formatCurrency(o.subtotal)}</span>
              </div>
              <div className="border-t border-border mt-2 pt-2 flex items-center gap-2">
                <span className="font-semibold">Acciones:</span>
                <button
                  onClick={() => {
                    setEditing(o);
                    setStatusForm(o.status || "Pending");
                  }}
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
        })}
        {orders.length === 0 && (
          <div className="text-center text-sm text-sub py-6 border border-dashed border-border rounded-md">
            No hay pedidos
          </div>
        )}
      </div>
      <div className="md:hidden mt-2">
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(orders.length / pageSize))}
          onPageChange={setPage}
        />
      </div>

      {/* Edit Modal */}
      <AdminEntityModal
        open={!!editing}
        title={editing ? `Editar pedido #${editing.id}` : ""}
        onClose={() => setEditing(null)}
        onSubmit={async () => {
          if (!editing) return;
          setSaving(true);
          await updateStatus(editing.id, statusForm);
          setSaving(false);
          setEditing(null);
        }}
        submitLabel="Guardar cambios"
        loading={saving}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-sub uppercase">
              Estado
            </label>
            <select
              value={statusForm}
              onChange={(e) => setStatusForm(e.target.value)}
              className="rounded-md border border-border bg-surface text-main px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {editing && (
            <div className="text-xs text-sub space-y-1">
              <p>
                <strong>Usuario:</strong> {editing.userEmail || "-"}
              </p>
              <p>
                <strong>Subtotal:</strong> {formatCurrency(editing.subtotal)}
              </p>
              <p>
                <strong>Items:</strong> {editing.items?.length || 0}
              </p>
            </div>
          )}
        </div>
      </AdminEntityModal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteOrder(toDelete.id);
          setToDelete(null);
        }}
        title="Eliminar pedido"
        message={toDelete ? `Eliminar pedido #${toDelete.id}?` : ""}
        cancelText="Cancelar"
        confirmText="Eliminar"
      />
    </div>
  );
};

export default AdminOrders;
