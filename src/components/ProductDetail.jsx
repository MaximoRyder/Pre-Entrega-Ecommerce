import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { ToastContext } from "../context/ToastContext";
import "../styles/ProductDetail.css";
import QuantitySelector from "./QuantitySelector";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const [qty, setQty] = useState(1);
  const { showToast } = useContext(ToastContext);

  const formatPrice = (value) => {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalPrice = product ? Number(product.price) * qty : 0;

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
            {product?.rating?.count ?? 0} disponibles
          </div>
        </div>

        <div className="pd-quantity-section">
          <div className="pd-quantity-label">Cantidad:</div>
          <div className="quantity-selector-wrapper">
            <QuantitySelector
              value={qty}
              onChange={setQty}
              min={1}
              max={product?.rating?.count ?? 9999}
              onDelete={null}
            />
          </div>
        </div>

        <div className="pd-total-section">
          <div className="pd-total-row">
            <span className="pd-total-label">Total:</span>
            <div className="pd-total-price">${formatPrice(totalPrice)}</div>
          </div>
        </div>

        <button
          className="btn pd-add-to-cart"
          data-variant="primary"
          data-visual="solid"
          onClick={() => {
            addToCart({
              id: product.id,
              name: product.title,
              price: `$${formatPrice(product.price)}`,
              imageUrl: product.image,
              quantity: qty,
            });
            showToast(`${product.title} añadido al carrito`);
          }}
        >
          <span className="material-symbols-rounded">add_shopping_cart</span>
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
