import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { ToastContext } from "../context/ToastContext";
import { formatCurrency, parseNumber } from "../utils/format";
import ConfirmModal from "./ConfirmModal";
import QuantitySelector from "./QuantitySelector";

const CartPage = () => {
  const { cart, decreaseQuantity, addToCart, removeFromCart, clearCart } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [toDelete, setToDelete] = useState(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [productStocks, setProductStocks] = useState({});

  const PRODUCTS_API =
    import.meta.env.VITE_PRODUCTS_API ||
    "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";

  async function updateQuantityWithRetry(productUrl, quantity, attempts = 3) {
    let lastErr = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const getRes = await fetch(productUrl);
        if (!getRes.ok) throw new Error(`GET ${getRes.status}`);
        const prod = await getRes.json();
        prod.quantity = quantity;
        const putRes = await fetch(productUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prod),
        });
        if (!putRes.ok) {
          const text = await putRes.text().catch(() => null);
          throw new Error(`PUT ${putRes.status} ${text || ""}`);
        }
        return putRes;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 250 * Math.pow(2, i)));
      }
    }
    throw lastErr;
  }

  const subtotal = cart.reduce((s, item) => {
    const price = parseNumber(item.price);
    return s + price * (item.quantity || 1);
  }, 0);

  useEffect(() => {
    let mounted = true;
    async function loadStocks() {
      try {
        if (!cart || cart.length === 0) {
          if (mounted) setProductStocks({});
          return;
        }
        const ids = cart.map((i) => i.id);
        const results = await Promise.all(
          ids.map((id) =>
            fetch(`${PRODUCTS_API}/${id}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        const map = {};
        for (const p of results) {
          if (p && p.id)
            map[p.id] = Number(p.quantity ?? p.stock ?? p.rating?.count ?? 0);
        }
        if (mounted) setProductStocks(map);
      } catch (err) {
        console.warn("No se pudo obtener stock de productos:", err);
      }
    }
    loadStocks();
    return () => {
      mounted = false;
    };
  }, [cart, PRODUCTS_API]);

  const handleFinalize = async () => {
    if (cart.length === 0) {
      showToast("No hay productos en el carrito", 1800, "info");
      return;
    }
    if (!user || !user.email) {
      setLoginPrompt(true);
      return;
    }

    const API =
      import.meta.env.VITE_ORDERS_API ||
      "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/orders";

    // Verify availability
    let productsMap = {};
    try {
      const ids = cart.map((it) => it.id);
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`${PRODUCTS_API}/${id}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );
      for (const p of results) {
        if (!p || !p.id) continue;
        const available = Number(p.quantity ?? p.stock ?? p.rating?.count ?? 0);
        productsMap[p.id] = { product: p, available };
      }
      const shortages = [];
      for (const it of cart) {
        const desired = Number(it.quantity || 1);
        const meta = productsMap[it.id];
        const avail = meta ? meta.available : 0;
        if (desired > avail) shortages.push({ name: it.name, desired, avail });
      }
      if (shortages.length > 0) {
        const names = shortages
          .map(
            (s) => `${s.name} (pedido: ${s.desired}, disponible: ${s.avail})`
          )
          .join(", ");
        showToast(`Stock insuficiente: ${names}`, 5000, "error");
        return;
      }
    } catch (err) {
      console.error("Error verificando stock:", err);
      showToast(
        "No se pudo verificar stock. Intenta nuevamente.",
        3000,
        "error"
      );
      return;
    }

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

    // First: attempt to decrement stock for each item. Rollback on failure.
    const prevQuantities = {};
    const updatedIds = [];
    try {
      for (const it of order.items) {
        const prodRes = await fetch(`${PRODUCTS_API}/${it.id}`);
        if (!prodRes.ok) throw new Error(`No se pudo cargar producto ${it.id}`);
        const prod = await prodRes.json();
        const available = Number(
          prod.quantity ?? prod.stock ?? prod.rating?.count ?? 0
        );
        const desired = Number(it.quantity || 1);
        if (desired > available)
          throw new Error(`Stock insuficiente para ${it.name}`);
        const newCount = Math.max(0, available - desired);
        prevQuantities[it.id] = available;
        await updateQuantityWithRetry(`${PRODUCTS_API}/${it.id}`, newCount);
        updatedIds.push(it.id);
      }
    } catch (uerr) {
      console.error("Error actualizando stock antes de crear pedido:", uerr);
      // rollback
      for (const id of updatedIds) {
        try {
          const prev = prevQuantities[id];
          await updateQuantityWithRetry(`${PRODUCTS_API}/${id}`, prev);
        } catch (rbErr) {
          console.error("Rollback failed for", id, rbErr);
        }
      }
      showToast(
        "No se pudo procesar el pedido por problemas de stock. Intenta nuevamente.",
        4500,
        "error"
      );
      return;
    }

    // All stock updates succeeded — now create the order remotely
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        console.error("Error creando pedido", res.status, text);
        // rollback stock
        for (const id of updatedIds) {
          try {
            const prev = prevQuantities[id];
            await updateQuantityWithRetry(`${PRODUCTS_API}/${id}`, prev);
          } catch (rbErr) {
            console.error("Rollback failed for", id, rbErr);
          }
        }
        throw new Error(text || "No se pudo crear el pedido");
      }
      await res.json();
      showToast("Pedido creado correctamente", 3000, "success");
      clearCart();
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
        localStorage.setItem("local_orders", JSON.stringify(existing));
        clearCart();
        showToast("Pedido guardado localmente (fallback)", 3500, "info");
      } catch (e) {
        console.error("No se pudo guardar pedido localmente", e);
        showToast(
          `Error al crear el pedido: ${err.message || err}`,
          4000,
          "error"
        );
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 grid lg:grid-cols-3 gap-8">
      {/* Left: Items */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-main">
          Tu Carrito ({cart.reduce((s, i) => s + (i.quantity || 1), 0)})
        </h2>
        {cart.length === 0 ? (
          <p className="text-sm text-sub">Tu carrito está vacío</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border border-border bg-surface shadow-sm p-4"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-contain rounded-md bg-surface-hover"
                />
                <div className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <strong className="text-sm font-medium line-clamp-2 text-main">
                      {item.name}
                    </strong>
                    <span className="text-sm font-semibold text-main">
                      {formatCurrency(parseNumber(item.price))}
                    </span>
                  </div>
                  <div>
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

      {/* Right: Summary */}
      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-surface shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-main">
            Resumen del Pedido
          </h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-sub">Subtotal</span>
            <span className="font-medium text-main">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-sub">Envío</span>
            <span className="font-medium text-main">Gratis</span>
          </div>
          <hr className="border-border" />
          <div className="flex items-center justify-between text-base font-semibold text-main">
            <strong>Total</strong>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setClearConfirm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-red-500 text-red-500 hover:bg-red-900/20 text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-red-500/40"
            >
              Vaciar carrito
            </button>
            <button
              onClick={handleFinalize}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
            >
              Finalizar compra
            </button>
          </div>
        </div>
      </aside>

      {/* Modals */}
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
        open={loginPrompt}
        onClose={() => setLoginPrompt(false)}
        onConfirm={() => {
          setLoginPrompt(false);
          navigate("/login", { state: { from: location } });
        }}
        title="Necesitás iniciar sesión"
        message="Para completar la orden debes iniciar sesión. ¿Deseas ir a la página de inicio de sesión ahora?"
        cancelText="Cancelar"
        confirmText="Ir a iniciar sesión"
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
