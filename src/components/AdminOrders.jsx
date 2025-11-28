import { useEffect, useState } from "react";
import "../styles/AdminOrders.css";
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
    setLoading(true);
    try {
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
      }
      // if all succeeded, clear local orders
      localStorage.removeItem("local_orders");
      await refresh();
    } catch (err) {
      console.error("Error sincronizando pedidos locales:", err);
      setError(err.message || "Error sincronizando pedidos locales");
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

  if (loading) return <p>Cargando pedidos...</p>;
  if (error) return <p>Error: {error}</p>;

  const localCount = (
    JSON.parse(localStorage.getItem("local_orders") || "[]") || []
  ).length;

  return (
    <div className="admin-orders">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>Pedidos</h3>
        <div>
          {localCount > 0 && (
            <button
              className="btn"
              style={{ marginRight: 8 }}
              onClick={syncLocalOrders}
            >
              Sincronizar {localCount} pedido(s) locales
            </button>
          )}
        </div>
      </div>
      {orders.length === 0 ? (
        <p>No hay pedidos</p>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-top">
                <div>
                  <strong>#{o.id}</strong> — {o.userEmail}
                </div>
                <div>{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="order-body">
                <div className="order-items">
                  {o.items && o.items.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {o.items.map((it, idx) => (
                          <tr key={idx}>
                            <td>{it.name}</td>
                            <td>
                              {formatNumber(it.quantity, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td>{formatCurrency(it.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No hay items</p>
                  )}
                </div>
                <div className="order-actions">
                  <div>Subtotal: {formatCurrency(o.subtotal)}</div>
                  <div>
                    Estado:
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <button className="btn" onClick={() => setToDelete(o)}>
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
