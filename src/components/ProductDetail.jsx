import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { ToastContext } from "../context/ToastContext";
import { formatCurrency, formatNumber, parseNumber } from "../utils/format";
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

  const existingInCart = (() => {
    if (!cart || !product) return 0;
    const found = cart.find((it) => String(it.id) === String(product.id));
    return found ? Number(found.quantity) || 0 : 0;
  })();

  const unitPrice = product ? parseNumber(product.price) : 0;
  const displayedQuantity = existingInCart > 0 ? existingInCart : qty;
  const totalPrice = product ? unitPrice * displayedQuantity : 0;

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

   Load product data
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
            console.warn("MockAPI invalid/empty body, fallback:", e.message);
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

  if (loading)
    return <p className="text-sub">Cargando detalle del producto...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!product) return <p className="text-sub">Producto no encontrado</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10">
      <Helmet>
        <title>{product.title} | Mi Tienda</title>
        <meta name="description" content={product.description} />
      </Helmet>
      {/* Left column */}
      <div className="space-y-6">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface border border-border shadow-sm flex items-center justify-center p-4">
          <img
            src={product.image}
            alt={product.title}
            className="object-contain h-full w-full"
          />
        </div>
        <div className="space-y-3">
          <span className="uppercase tracking-wide text-xs font-medium text-primary-500">
            {product.category}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-main">
            {product.title}
          </h1>
          <p className="text-sm leading-relaxed text-sub whitespace-pre-line">
            {product.description}
          </p>
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-6">
        {/* Price / stock */}
        <div className="rounded-lg border border-border bg-surface shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sub">
              Precio unitario:
            </span>
            <div className="text-lg font-semibold text-main">
              {formatCurrency(product.price)}
            </div>
          </div>
          <div className="text-xs text-sub">
            {(() => {
              const s = getStockFromProduct(product);
              if (s == null) return "Sin información";
              return `${formatNumber(s, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })} disponibles`;
            })()}
          </div>
        </div>

        {/* Quantity */}
        <div className="rounded-lg border border-border bg-surface shadow-sm p-5 space-y-3">
          <div className="text-sm font-medium text-sub">Cantidad:</div>
          <div>
            {remainingStock === 0 && existingInCart === 0 ? (
              <div className="text-sm font-semibold text-red-600">Agotado</div>
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
                      price: parseNumber(product.price),
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

        {/* Total */}
        <div className="rounded-lg border border-border bg-surface shadow-sm p-5 flex items-center justify-between">
          <span className="text-sm font-medium text-sub">Total:</span>
          <div className="text-xl font-semibold text-main">
            {formatCurrency(totalPrice)}
          </div>
        </div>

        {existingInCart === 0 && (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-3 transition-colors shadow-sm focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
            disabled={remainingStock === 0}
            onClick={() => {
              const qtyToAdd = Number(qty) || 1;
              if (qtyToAdd <= 0) return;
              if (remainingStock !== null && qtyToAdd > remainingStock) {
                showToast(
                  `No puedes agregar ${qtyToAdd} unidades. Stock restante: ${formatNumber(
                    remainingStock,
                    { minimumFractionDigits: 0, maximumFractionDigits: 0 }
                  )}`,
                  2200,
                  "info"
                );
                return;
              }
              addToCart({
                id: product.id,
                name: product.title,
                price: parseNumber(product.price),
                imageUrl: product.image,
                quantity: qtyToAdd,
              });
              showToast(`${product.title} añadido al carrito`);
              if (remainingStock === null) setQty(1);
              else setQty(remainingStock > 0 ? 1 : 0);
            }}
          >
            <ShoppingCartIcon className="w-5 h-5" />
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
