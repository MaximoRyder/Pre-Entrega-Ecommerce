import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { ToastContext } from "../context/ToastContext";
import "../styles/CartPage.css";
import { formatCurrency, parseNumber } from "../utils/format";
import ConfirmModal from "./ConfirmModal";
import QuantitySelector from "./QuantitySelector";

const CartPage = () => {
  const { cart, decreaseQuantity, addToCart, removeFromCart, clearCart } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [toDelete, setToDelete] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [productStocks, setProductStocks] = useState({});

  const subtotal = cart.reduce((s, item) => {
    const price = parseNumber(item.price);
    return s + price * (item.quantity || 1);
  }, 0);

  useEffect(() => {
    let mounted = true;
    const API = "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";
    async function loadStocks() {
      try {
        if (!cart || cart.length === 0) {
          if (mounted) setProductStocks({});
          return;
        }
        const ids = cart.map((i) => i.id);
        const results = await Promise.all(
          ids.map((id) =>
            fetch(`${API}/${id}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        const map = {};
        for (const p of results) {
          if (p && p.id) {
            map[p.id] = Number(p.rating?.count ?? p.quantity ?? p.stock ?? 0);
          }
        }
        if (mounted) setProductStocks(map);
      } catch (err) {
        console.warn("No se pudo obtener stock de productos:", err);
      }
    }

    loadStocks();
    return () => (mounted = false);
  }, [cart]);

  return (
    <div className="cart-page">
      <div className="cart-page-left">
        <h2>Tu Carrito ({cart.reduce((s, i) => s + (i.quantity || 1), 0)})</h2>
        {cart.length === 0 ? (
          <p>Tu carrito está vacío</p>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-row">
                <img src={item.imageUrl} alt={item.name} />
                <div className="cart-row-info">
                  <div className="cart-row-top">
                    <strong>{item.name}</strong>
                    <span className="cart-price">
                      {formatCurrency(parseNumber(item.price))}
                    </span>
                  </div>
                  <div className="cart-row-bottom">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(v) => {
                        if (!v || Number(v) < 1) return removeFromCart(item.id);
                        const desired = Number(v);
                        const diff = desired - (item.quantity || 0);
                        if (diff > 0) {
                          addToCart({ ...item, quantity: diff });
                          showToast(`${item.name} añadido al carrito`);
                        }
                        if (diff < 0)
                          Array.from({ length: Math.abs(diff) }).forEach(() =>
                            decreaseQuantity(item.id)
                          );
                      }}
                      min={1}
                      stock={productStocks[item.id] ?? null}
                      existing={0}
                      onDelete={() => setToDelete(item)}
                      deleteLabel={`Eliminar ${item.name}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="cart-page-right">
        <div className="order-summary">
          <h3>Resumen del Pedido</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Envío</span>
            <span>Gratis</span>
          </div>
          <hr />
          <div className="summary-total">
            <strong>Total</strong>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="cart-actions">
            <button
              className="btn"
              data-variant="error"
              data-visual="soft"
              onClick={() => setClearConfirm(true)}
            >
              Vaciar carrito
            </button>

            <button
              className="btn"
              data-variant="primary"
              data-visual="solid"
              onClick={async () => {
                if (cart.length === 0) {
                  showToast("No hay productos en el carrito", 1800, "info");
                  return;
                }
                if (!user || !user.email) {
                  showToast(
                    "Debes iniciar sesión para finalizar la compra",
                    2000,
                    "info"
                  );
                  return;
                }

                const API =
                  import.meta.env.VITE_ORDERS_API ||
                  "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/orders";
                const order = {
                  userEmail: String(user.email || "").trim(),
                  items: cart.map((it) => ({
                    id: String(it.id || ""),
                    name: String(it.name || ""),
                    price: Number(parseNumber(it.price) || 0),
                    quantity: Number(it.quantity || 1),
                  })),
                  subtotal: Number(subtotal || 0),
                  status: "pending",
                };

                try {
                  // Sanitize and simplify payload for MockAPI
                  const payload = order;
                  console.debug("Creando pedido (payload):", payload);
                  const res = await fetch(API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  if (!res.ok) {
                    const text = await res.text().catch(() => null);
                    console.error("Error creando pedido", res.status, text);
                    throw new Error(text || "No se pudo crear el pedido");
                  }
                  await res.json();
                  clearCart();
                  showToast("Pedido creado correctamente", 3000, "success");
                } catch (err) {
                  console.error(err);
                  // Fallback: save order locally so user/admin can still see it
                  try {
                    const fallback = {
                      ...order,
                      id: `local-${Date.now()}`,
                      createdAt: new Date().toISOString(),
                      local: true,
                    };
                    const existing = JSON.parse(
                      localStorage.getItem("local_orders") || "[]"
                    );
                    existing.push(fallback);
                    localStorage.setItem(
                      "local_orders",
                      JSON.stringify(existing)
                    );
                    clearCart();
                    showToast(
                      "Pedido guardado localmente (fallback)",
                      3500,
                      "info"
                    );
                  } catch (e) {
                    console.error("No se pudo guardar pedido localmente", e);
                    showToast(
                      `Error al crear el pedido: ${err.message || err}`,
                      4000,
                      "error"
                    );
                  }
                }
              }}
            >
              Finalizar compra
            </button>
          </div>
        </div>
      </aside>
      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            removeFromCart(toDelete.id);
            showToast(`${toDelete.name} eliminado del carrito`, 1800, "info");
            setToDelete(null);
          }
        }}
        title="¿Estás seguro?"
        message={
          toDelete
            ? `¿Deseas eliminar el producto "${toDelete.name}" de tu carrito? Esta acción no se puede deshacer.`
            : "¿Deseas eliminar este producto de tu carrito? Esta acción no se puede deshacer."
        }
        cancelText="Cancelar"
        confirmText="Eliminar"
      />
      <ConfirmModal
        open={clearConfirm}
        onClose={() => setClearConfirm(false)}
        onConfirm={() => {
          clearCart();
          showToast("Carrito vaciado", 1800, "info");
          setClearConfirm(false);
        }}
        title="¿Vaciar carrito?"
        message="Si vacías el carrito se eliminarán todos los productos seleccionados. Esta acción no se puede deshacer."
        cancelText="Cancelar"
        confirmText="Vaciar"
      />
    </div>
  );
};

export default CartPage;
