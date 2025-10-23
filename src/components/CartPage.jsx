import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { ToastContext } from "../context/ToastContext";
import "../styles/CartPage.css";
import ConfirmModal from "./ConfirmModal";
import QuantitySelector from "./QuantitySelector";

const CartPage = () => {
  const { cart, decreaseQuantity, addToCart, removeFromCart, clearCart } =
    useContext(CartContext);
  const { showToast } = useContext(ToastContext);
  const [toDelete, setToDelete] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const subtotal = cart.reduce((s, item) => {
    const price =
      typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^0-9.-]+/g, ""))
        : Number(item.price || 0);
    return s + price * (item.quantity || 1);
  }, 0);

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
                    <span className="cart-price">{item.price}</span>
                  </div>
                  <div className="cart-row-bottom">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(v) => {
                        if (!v || Number(v) < 1) return removeFromCart(item.id);
                        const diff = Number(v) - (item.quantity || 0);
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
                      max={9999}
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
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Envío</span>
            <span>Gratis</span>
          </div>
          <hr />
          <div className="summary-total">
            <strong>Total</strong>
            <strong>${subtotal.toFixed(2)}</strong>
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
              onClick={() => {
                if (cart.length === 0) {
                  showToast("No hay productos en el carrito", 1800, "info");
                  return;
                }
                clearCart();
                showToast(
                  "¡Gracias por su compra! Lo contactaremos a la brevedad para coordinar la entrega.",
                  3000,
                  "success"
                );
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
