import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { formatCurrency, formatNumber, parseNumber } from "../utils/format";
import {
  validateCategory,
  validatePrice,
  validateProductTitle,
  validateQuantity,
  validateUrl,
} from "../utils/validators";
import AdminEntityModal from "./AdminEntityModal";
import ConfirmModal from "./ConfirmModal";
import FormField from "./FormField";
import Pagination from "./Pagination";

const API_ENV = import.meta.env.VITE_PRODUCTS_API;
const API =
  API_ENV || "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";
const CAT_API_ENV = import.meta.env.VITE_CATEGORIES_API;
const CAT_API =
  CAT_API_ENV ||
  "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/categories";

const emptyProduct = {
  title: "",
  price: "",
  quantity: "",
  category: "",
  image: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    if (!API) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error cargando productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const loadCategories = async () => {
      if (!CAT_API) return;
      try {
        const res = await fetch(CAT_API);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((c) => {
            if (typeof c === "string") return { id: c, name: c, slug: c };
            return {
              id: c.id ?? c.slug ?? c.name ?? c.title,
              name: c.name ?? c.title ?? c.slug ?? c.id,
              slug:
                c.slug ??
                (c.name
                  ? c.name.toLowerCase().replace(/\s+/g, "-")
                  : undefined),
            };
          });
          setCategories(mapped);
        }
      } catch (e) {
        console.error("Error cargando categorías:", e);
        setError("Error cargando categorías");
      }
    };
    loadCategories();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyProduct);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || p.name || "",
      price: p.price != null ? formatNumber(p.price) : "",
      quantity:
        p.quantity != null
          ? String(p.quantity)
          : p.stock != null
          ? String(p.stock)
          : "",
      category: p.category || "",
      image: p.image || p.imageUrl || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    const titleError = validateProductTitle(form.title);
    if (titleError) newErrors.title = titleError;

    const priceError = validatePrice(form.price);
    if (priceError) newErrors.price = priceError;

    const qtyError = validateQuantity(form.quantity);
    if (qtyError) newErrors.quantity = qtyError;

    const catError = validateCategory(form.category);
    if (catError) newErrors.category = catError;

    const imgError = validateUrl(form.image);
    if (imgError) newErrors.image = imgError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const save = async () => {
    if (!API) return;
    if (!validate()) return;
    setSaving(true);
    try {
      const qty = parseInt(form.quantity || 0, 10);
      const body = {
        title: form.title.trim(),
        price: parseNumber(form.price),
        quantity: qty,
        category: form.category.trim(),
        image: form.image.trim(),
      };
      let res;
      if (editing) {
        res = await fetch(`${API}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) throw new Error("Error guardando producto");
      await load();
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (p) => setDeleting(p);

  const doDelete = async () => {
    if (!API || !deleting) return;
    try {
      const res = await fetch(`${API}/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando producto");
      setDeleting(null);
      await load();
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="hidden md:flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight">Productos</h3>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-3 py-2 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
        >
          <PlusIcon className="w-5 h-5" /> Agregar
        </button>
      </div>
      {/* Mensaje de endpoint por defecto removido a pedido del usuario */}
      {loading && <p className="text-sm text-muted">Cargando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {/* Vista tabla (desktop) */}
      <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm hidden md:block">
        <table className="w-full text-xs sm:text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wide text-muted border-b border-border">
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Título</th>
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Precio</th>
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Cantidad</th>
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Categoría</th>
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.slice((page - 1) * pageSize, page * pageSize).map((p) => (
              <tr key={p.id} className="border-b last:border-b-0 border-border">
                <td
                  className="px-2 py-1.5 sm:px-3 sm:py-2 max-w-[140px] truncate"
                  title={p.title || p.name}
                >
                  {p.title || p.name}
                </td>
                <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                  {formatCurrency(parseNumber(p.price))}
                </td>
                <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                  {p.quantity ?? p.stock ?? "-"}
                </td>
                <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                  {(() => {
                    if (!categories.length) return p.category || "-";
                    const match = categories.find(
                      (c) =>
                        c.id === p.category ||
                        c.slug === p.category ||
                        c.name === p.category
                    );
                    return match ? match.name : p.category || "-";
                  })()}
                </td>
                <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-surface-hover text-sub"
                      aria-label="Editar"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(p)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-red-500 hover:bg-red-500/10"
                      aria-label="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && !error && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-xs text-muted"
                >
                  Sin productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="hidden md:block mt-3">
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(products.length / pageSize))}
          onPageChange={setPage}
        />
      </div>

      {/* Vista móvil tipo tarjeta/lista */}
      <div className="md:hidden space-y-3">
        {products.slice((page - 1) * pageSize, page * pageSize).map((p) => {
          const catLabel = (() => {
            if (!categories.length) return p.category || "-";
            const match = categories.find(
              (c) =>
                c.id === p.category ||
                c.slug === p.category ||
                c.name === p.category
            );
            return match ? match.name : p.category || "-";
          })();
          return (
            <div
              key={p.id}
              className="border border-border rounded-md bg-surface shadow-sm px-3 py-2 text-sm"
            >
              <div className="space-y-1">
                <div className="flex">
                  <span className="font-semibold mr-1">Título:</span>
                  <span className="flex-1 truncate">{p.title || p.name}</span>
                </div>
                <div className="border-t border-border pt-1 flex">
                  <span className="font-semibold mr-1">Precio:</span>
                  <span className="flex-1">
                    {formatCurrency(parseNumber(p.price))}
                  </span>
                </div>
                <div className="border-t border-border pt-1 flex">
                  <span className="font-semibold mr-1">Cantidad:</span>
                  <span className="flex-1">{p.quantity ?? p.stock ?? "-"}</span>
                </div>
                <div className="border-t border-border pt-1 flex">
                  <span className="font-semibold mr-1">Categoría:</span>
                  <span className="flex-1">{catLabel}</span>
                </div>
              </div>
              <div className="border-t border-border mt-2 pt-2 flex items-center gap-2">
                <span className="font-semibold">Acciones:</span>
                <button
                  onClick={() => openEdit(p)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-surface-hover text-sub"
                  aria-label="Editar"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(p)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-red-500 hover:bg-red-500/10"
                  aria-label="Eliminar"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {products.length === 0 && !loading && !error && (
          <div className="text-center text-sm text-muted py-6 border border-dashed border-border rounded-md">
            Sin productos
          </div>
        )}
      </div>
      <div className="md:hidden mt-2">
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(products.length / pageSize))}
          onPageChange={setPage}
        />
      </div>

      <AdminEntityModal
        open={modalOpen}
        title={editing ? "Editar producto" : "Agregar producto"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
        submitLabel={editing ? "Guardar cambios" : "Crear"}
        loading={saving}
      >
        <div className="grid gap-4">
          <FormField label="Título" htmlFor="title" error={errors.title}>
            <input
              id="title"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              required
              className={`rounded-md border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-main ${
                errors.title ? "border-red-500" : "border-border"
              }`}
            />
          </FormField>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <FormField label="Precio" htmlFor="price" error={errors.price}>
                <input
                  id="price"
                  type="text"
                  placeholder="0,00"
                  value={form.price}
                  onChange={(e) => {
                    let val = e.target.value;
                    val = val.replace(/[^0-9,]/g, "");

                    const parts = val.split(",");
                    if (parts.length > 2) return;

                    if (parts[1] && parts[1].length > 2) return;

                    let integer = parts[0];
                    if (integer.length > 1 && integer.startsWith("0")) {
                      integer = integer.replace(/^0+/, "");
                    }

                    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

                    const newVal =
                      parts.length > 1 ? `${integer},${parts[1]}` : integer;

                    setForm({ ...form, price: newVal });
                    if (errors.price) setErrors({ ...errors, price: null });
                  }}
                  required
                  className={`rounded-md border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-main ${
                    errors.price ? "border-red-500" : "border-border"
                  }`}
                />
              </FormField>
            </div>
            <div className="flex-1">
              <FormField
                label="Cantidad"
                htmlFor="quantity"
                error={errors.quantity}
              >
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => {
                    setForm({ ...form, quantity: e.target.value });
                    if (errors.quantity)
                      setErrors({ ...errors, quantity: null });
                  }}
                  required
                  className={`rounded-md border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-main ${
                    errors.quantity ? "border-red-500" : "border-border"
                  }`}
                />
              </FormField>
            </div>
          </div>
          <FormField
            label="Categoría"
            htmlFor="category"
            error={errors.category}
          >
            {categories.length > 0 ? (
              <select
                id="category"
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: null });
                }}
                className={`rounded-md border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-main ${
                  errors.category ? "border-red-500" : "border-border"
                }`}
              >
                <option value="">-- Seleccionar --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="category"
                value={form.category}
                onChange={(e) => {
                  setForm({ ...form, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: null });
                }}
                placeholder="Ingresar categoría"
                className={`rounded-md border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-main ${
                  errors.category ? "border-red-500" : "border-border"
                }`}
              />
            )}
          </FormField>
          <FormField label="Imagen (URL)" htmlFor="image" error={errors.image}>
            <input
              id="image"
              value={form.image}
              onChange={(e) => {
                setForm({ ...form, image: e.target.value });
                if (errors.image) setErrors({ ...errors, image: null });
              }}
              className={`rounded-md border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-main ${
                errors.image ? "border-red-500" : "border-border"
              }`}
            />
          </FormField>
        </div>
      </AdminEntityModal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        title="Eliminar producto"
        message={
          deleting ? `¿Eliminar "${deleting.title || deleting.name}"?` : ""
        }
        cancelText="Cancelar"
        confirmText="Eliminar"
      />
    </div>
  );
};

export default AdminProducts;
