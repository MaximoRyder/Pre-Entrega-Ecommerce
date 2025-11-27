import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { ToastContext } from "../context/ToastContext";
import "../styles/ProductDetail.css";
import ConfirmModal from "./ConfirmModal";
import QuantitySelector from "./QuantitySelector";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, cart, decreaseQuantity, removeFromCart } =
    useContext(CartContext);
  const [qty, setQty] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useContext(ToastContext);

  const formatPrice = (value) => {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalPrice = product ? Number(product.price) * qty : 0;

  const existingInCart = (() => {
    if (!cart || !product) return 0;
    const found = cart.find((it) => String(it.id) === String(product.id));
    return found ? Number(found.quantity) || 0 : 0;
  })();

  const getStockFromProduct = (p) => {
    if (!p) return null;
    const s = p.rating?.count ?? p.quantity ?? p.stock ?? p.count;
    if (s == null) return null;
    return Number(s);
  };

  const availableStock = getStockFromProduct(product);
  const remainingStock =
    availableStock == null
      ? null
      : Math.max(0, availableStock - existingInCart);

  useEffect(() => {
    if (existingInCart > 0) return;
    if (remainingStock === null) return;
    if (remainingStock === 0) {
      setQty(0);
    } else {
      setQty((prev) => {
        const n = Number(prev) || 0;
        if (n < 1) return 1;
        if (n > remainingStock) return remainingStock;
        return n;
      });
    }
  }, [remainingStock, existingInCart]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const MOCK_API = `https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products/${id}`;
        const FALLBACK = `https://fakestoreapi.com/products/${id}`;

        async function safeJson(res) {
          const text = await res.text();
          if (!text || !text.trim()) throw new Error("Empty response body");
          try {
            return JSON.parse(text);
          } catch {
            throw new Error("Invalid JSON in response");
          }
        }

        let res = await fetch(MOCK_API);
        if (res.ok) {
          try {
            const data = await safeJson(res);
            if (mounted) setProduct(data);
            return;
          } catch (e) {
            console.warn(
              "MockAPI returned invalid/empty body, trying fallback:",
              e.message
            );
          }
        }

        res = await fetch(FALLBACK);
        if (!res.ok) throw new Error("Error al obtener el producto (fallback)");
        const data = await safeJson(res);
        if (mounted) setProduct(data);
      } catch (err) {
        if (mounted) setError(err.message || "Error desconocido");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <p>Cargando detalle del producto...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Producto no encontrado</p>;

  return (
    <div className="product-detail-card">
      <div className="pd-left">
        <div className="pd-image-container">
          <img src={product.image} alt={product.title} className="pd-image" />
        </div>

        <div className="pd-info">
          <span className="pd-category">{product.category}</span>
          <h1 className="pd-title">{product.title}</h1>
          <p className="pd-desc">{product.description}</p>
        </div>
      </div>

      <div className="pd-right">
        <div className="pd-price-section">
          <div className="pd-price-row">
            <span className="pd-price-label">Precio unitario:</span>
            <div className="pd-price">${formatPrice(product.price)}</div>
          </div>
          <div className="pd-stock">
            {(() => {
              const s = getStockFromProduct(product);
              if (s == null) return "Sin información";
              return `${s} disponibles`;
            })()}
          </div>
        </div>

        <div className="pd-quantity-section">
          <div className="pd-quantity-label">Cantidad:</div>
          <div className="quantity-selector-wrapper">
            {remainingStock === 0 && existingInCart === 0 ? (
              <div style={{ color: "#b00" }}>Agotado</div>
            ) : (
              <QuantitySelector
                value={existingInCart > 0 ? existingInCart : qty}
                onChange={(v) => {
                  if (!v || Number(v) < 1) {
                    if (existingInCart > 0) return removeFromCart(product.id);
                    return setQty(1);
                  }
                  const desired = Number(v);
                  const diff = desired - (existingInCart || 0);
                  if (diff > 0) {
                    addToCart({
                      id: product.id,
                      name: product.title,
                      price: `$${formatPrice(product.price)}`,
                      imageUrl: product.image,
                      quantity: diff,
                    });
                  }
                  if (diff < 0)
                    Array.from({ length: Math.abs(diff) }).forEach(() =>
                      decreaseQuantity(product.id)
                    );

                  if (existingInCart === 0) setQty(desired);
                }}
                min={1}
                stock={availableStock}
                existing={0}
                onDelete={
                  existingInCart > 0 ? () => setShowConfirm(true) : null
                }
              />
            )}
          </div>
        </div>

        <div className="pd-total-section">
          <div className="pd-total-row">
            <span className="pd-total-label">Total:</span>
            <div className="pd-total-price">${formatPrice(totalPrice)}</div>
          </div>
        </div>

        {existingInCart === 0 && (
          <button
            className="btn pd-add-to-cart"
            data-variant="primary"
            data-visual="solid"
            disabled={remainingStock === 0}
            onClick={() => {
              const qtyToAdd = Number(qty) || 1;
              if (qtyToAdd <= 0) return;
              if (remainingStock !== null && qtyToAdd > remainingStock) {
                showToast(
                  `No puedes agregar ${qtyToAdd} unidades. Stock restante: ${remainingStock}`,
                  2200,
                  "info"
                );
                return;
              }

              addToCart({
                id: product.id,
                name: product.title,
                price: `$${formatPrice(product.price)}`,
                imageUrl: product.image,
                quantity: qtyToAdd,
              });
              showToast(`${product.title} añadido al carrito`);

              if (remainingStock === null) setQty(1);
              else setQty(remainingStock > 0 ? 1 : 0);
            }}
          >
            <span className="material-symbols-rounded">add_shopping_cart</span>
            {remainingStock === 0 ? "Agotado" : "Agregar al carrito"}
          </button>
        )}
        <ConfirmModal
          open={!!showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            removeFromCart(product.id);
            showToast(`${product.title} eliminado del carrito`, 1800, "info");
            setShowConfirm(false);
          }}
          title="¿Estás seguro?"
          message={`¿Deseas eliminar el producto "${product.title}" de tu carrito? Esta acción no se puede deshacer.`}
          cancelText="Cancelar"
          confirmText="Eliminar"
        />
      </div>
    </div>
  );
};

export default ProductDetail;
