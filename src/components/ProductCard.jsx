import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { ToastContext } from "../context/ToastContext";
import "../styles/ProductCard.css";
import ConfirmModal from "./ConfirmModal";
import QuantitySelector from "./QuantitySelector";

const ProductCard = ({ id, name, price, imageUrl, fullProduct }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } =
    useContext(CartContext);
  const { showToast } = useContext(ToastContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const product = fullProduct
    ? {
        id: fullProduct.id,
        name: fullProduct.title || name,
        price: fullProduct.price != null ? `$${fullProduct.price}` : price,
        imageUrl: fullProduct.image || imageUrl,
        category: fullProduct.category,
        stock: Number(
          fullProduct?.rating?.count ??
            fullProduct?.quantity ??
            fullProduct?.stock ??
            0
        ),
      }
    : { id, name, price, imageUrl };

  const productInCart = cart.find((item) => item.id === id);
  const qty = productInCart ? productInCart.quantity : 1;
  const rawStock = fullProduct
    ? fullProduct?.rating?.count ??
      fullProduct?.quantity ??
      fullProduct?.stock ??
      fullProduct?.count ??
      null
    : null;
  const availableStock = typeof rawStock === "number" ? Number(rawStock) : null;
  const existingQty = productInCart ? productInCart.quantity : 0;
  const remainingStock =
    availableStock == null ? null : Math.max(0, availableStock - existingQty);

  return (
    <div className="product-card">
      <Link to={`/product/${id}`} className="pc-image-wrap">
        <img src={imageUrl} alt={name} />
      </Link>
      <div className="pc-body">
        <h3 className="pc-title">{name}</h3>
        <div className="pc-meta">
          <div className="pc-category">{product?.category}</div>
        </div>
        <div className="pc-bottom">
          <div className="pc-price-stock">
            <div className="pc-price">{price}</div>
            <div className="pc-stock">
              {(() => {
                const s =
                  fullProduct &&
                  (fullProduct.rating?.count ??
                    fullProduct.quantity ??
                    fullProduct.stock);
                if (s == null) return "Sin información";
                return `${s} disponibles`;
              })()}
            </div>
          </div>
          {productInCart ? (
            <div className="quantity-controls">
              <QuantitySelector
                value={qty}
                onChange={(v) => {
                  if (!v || Number(v) < 1) return removeFromCart(id);
                  const desired = Number(v);
                  const stock = availableStock;
                  if (typeof stock === "number" && desired > stock) {
                    showToast(
                      `No hay stock suficiente. Máximo: ${stock}`,
                      2000,
                      "info"
                    );
                    return;
                  }
                  const diff = desired - (productInCart.quantity || 0);
                  if (diff > 0) {
                    const canAdd = Math.min(
                      diff,
                      Math.max(0, stock - productInCart.quantity)
                    );
                    if (canAdd > 0) addToCart({ ...product, quantity: canAdd });
                  }
                  if (diff < 0)
                    Array.from({ length: Math.abs(diff) }).forEach(() =>
                      decreaseQuantity(id)
                    );
                }}
                min={1}
                stock={availableStock}
                existing={0}
                onDelete={() => setShowConfirm(true)}
                deleteLabel="Eliminar producto"
              />
            </div>
          ) : (
            <div className="product-card__footer">
              <button
                className="btn"
                data-variant="primary"
                data-visual="soft"
                data-size="sm"
                disabled={
                  typeof availableStock === "number"
                    ? availableStock <= 0
                    : false
                }
                onClick={() => {
                  if (
                    typeof availableStock === "number" &&
                    availableStock <= 0
                  ) {
                    showToast("Producto agotado", 1800, "info");
                    return;
                  }
                  const toAdd = Math.min(
                    1,
                    remainingStock == null ? 1 : remainingStock
                  );
                  if (toAdd <= 0) {
                    showToast("No hay stock disponible", 1800, "info");
                    return;
                  }
                  addToCart({ ...product, quantity: toAdd });
                  showToast(`${product.name || name} añadido al carrito`);
                }}
                style={{
                  "--button-hue": "30",
                  "--button-sat": "25%",
                  "--button-light": "36%",
                }}
              >
                <span
                  className="material-symbols-rounded"
                  style={{ fontSize: "20px" }}
                >
                  add_shopping_cart
                </span>
                Agregar al carrito
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          removeFromCart(id);
          showToast(
            `${product.name || name} eliminado del carrito`,
            1800,
            "info"
          );
          setShowConfirm(false);
        }}
        title="¿Estás seguro?"
        message={`¿Deseas eliminar el producto "${
          product.name || name
        }" de tu carrito? Esta acción no se puede deshacer.`}
        cancelText="Cancelar"
        confirmText="Eliminar"
      />
    </div>
  );
};

export default ProductCard;
