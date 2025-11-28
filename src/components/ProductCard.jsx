import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { ToastContext } from "../context/ToastContext";
import { formatCurrency, formatNumber, parseNumber } from "../utils/format";
import ConfirmModal from "./ConfirmModal";
import QuantitySelector from "./QuantitySelector";
import { ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";

const ProductCard = ({ id, name, price, imageUrl, fullProduct }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } =
    useContext(CartContext);
  const { showToast } = useContext(ToastContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const product = fullProduct
    ? {
        id: fullProduct.id,
        name: fullProduct.title || name,
        price:
          fullProduct.price != null
            ? Number(fullProduct.price)
            : parseNumber(price),
        imageUrl: fullProduct.image || imageUrl,
        category: fullProduct.category,
        stock: Number(
          fullProduct?.rating?.count ??
            fullProduct?.quantity ??
            fullProduct?.stock ??
            0
        ),
      }
    : { id, name, price: parseNumber(price), imageUrl };

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
    <div className="group bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <Link
        to={`/product/${id}`}
        className="block aspect-[4/3] bg-neutral-100 overflow-hidden"
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-neutral-800 line-clamp-2 min-h-[2.5rem]">
            {name}
          </h3>
          <div className="text-xs text-primary-600 font-medium">
            {product?.category}
          </div>
        </div>
        <div className="mt-auto space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-base font-semibold text-neutral-900">
              {formatCurrency(product.price)}
            </div>
            <div className="text-[11px] text-neutral-500">
              {(() => {
                const s =
                  fullProduct &&
                  (fullProduct.rating?.count ??
                    fullProduct.quantity ??
                    fullProduct.stock);
                if (s == null) return "Sin info";
                return `${formatNumber(s, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })} disp.`;
              })()}
            </div>
          </div>
          {productInCart ? (
            <div className="flex items-center justify-between gap-2">
              <QuantitySelector
                value={qty}
                onChange={(v) => {
                  if (!v || Number(v) < 1) return removeFromCart(id);
                  const desired = Number(v);
                  const stock = availableStock;
                  if (typeof stock === "number" && desired > stock) {
                    showToast(
                      `No hay stock suficiente. Máximo: ${formatNumber(stock, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}`,
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
              <button
                onClick={() => setShowConfirm(true)}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Quitar
              </button>
            </div>
          ) : (
            <button
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                typeof availableStock === "number" ? availableStock <= 0 : false
              }
              onClick={() => {
                if (typeof availableStock === "number" && availableStock <= 0) {
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
            >
              <ShoppingCartIcon className="w-5 h-5" />
              Agregar
            </button>
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
