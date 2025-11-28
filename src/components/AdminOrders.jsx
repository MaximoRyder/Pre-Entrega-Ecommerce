import { useEffect, useState } from "react";
import { formatCurrency, formatNumber } from "../utils/format";
import ConfirmModal from "./ConfirmModal";

const API =
  import.meta.env.VITE_ORDERS_API ||
  "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/orders";

const statusOptions = ["pending", "rejected", "processing", "shipped"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  // NOTE: PATCH can be blocked by some CORS policies on MockAPI. We use
  // `updateQuantityWithRetry` (below) which performs a GET + PUT as fallback.

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
        // also include local orders saved as fallback
        const local = JSON.parse(localStorage.getItem("local_orders") || "[]");
        const combined = [...local, ...data];
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
        // remove local metadata before sending
        const payload = { ...o };
        delete payload.id;
        delete payload.local;
        // ensure createdAt exists
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

        // after successful creation, decrement stock for each item
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
      // if all succeeded, clear local orders
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
      setOrders([...local, ...data].reverse());
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
          // update state
          setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status } : o))
          );
          return;
        }
      }
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold tracking-tight">Pedidos</h3>
        {localCount > 0 && (
          <button
            onClick={syncLocalOrders}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
          >
            Sincronizar {localCount} pedido(s) locales
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-600">No hay pedidos</p>
      ) : (
        <div className="grid gap-6">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-lg border border-gray-200 bg-white shadow-sm p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="text-sm font-medium text-gray-900 flex flex-wrap items-center gap-2">
                  <span className="font-semibold">#{o.id}</span> — {o.userEmail}
                  {o.local && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                      Local
                    </span>
                  )}
                  {o.syncError && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                      Sync Error
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  {o.items && o.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                            <th className="py-2 pr-4 font-medium">Producto</th>
                            <th className="py-2 pr-4 font-medium">Cantidad</th>
                            <th className="py-2 font-medium">Precio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.items.map((it, idx) => (
                            <tr
                              key={idx}
                              className="border-b last:border-b-0 border-gray-100"
                            >
                              <td className="py-2 pr-4">{it.name}</td>
                              <td className="py-2 pr-4">
                                {formatNumber(it.quantity, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                })}
                              </td>
                              <td className="py-2">
                                {formatCurrency(it.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No hay items</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Subtotal:{" "}
                    <span className="font-semibold">
                      {formatCurrency(o.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Estado:
                    </label>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button
                      onClick={() => setToDelete(o)}
                      className="inline-flex items-center gap-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50 text-xs font-medium px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-red-500/40"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
