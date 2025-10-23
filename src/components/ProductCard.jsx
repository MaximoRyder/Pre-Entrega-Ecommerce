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
        stock: fullProduct.rating?.count || 0,
      }
    : { id, name, price, imageUrl };

  const productInCart = cart.find((item) => item.id === id);
  const qty = productInCart ? productInCart.quantity : 1;

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
              {fullProduct?.rating?.count || "No"} disponibles
            </div>
          </div>
          {productInCart ? (
            <div className="quantity-controls">
              <QuantitySelector
                value={qty}
                onChange={(v) => {
                  if (!v || Number(v) < 1) return removeFromCart(id);
                  const diff = Number(v) - (productInCart.quantity || 0);
                  if (diff > 0) addToCart({ ...product, quantity: diff });
                  if (diff < 0)
                    Array.from({ length: Math.abs(diff) }).forEach(() =>
                      decreaseQuantity(id)
                    );
                }}
                min={1}
                max={product?.rating?.count ?? 9999}
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
                onClick={() => {
                  addToCart(product);
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
