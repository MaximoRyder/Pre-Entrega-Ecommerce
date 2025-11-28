import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { formatCurrency, parseNumber } from "../utils/format";
import AdminEntityModal from "./AdminEntityModal";
import ConfirmModal from "./ConfirmModal";

// Endpoint de productos: usa env si está definida, sino fallback al mockapi original
const API_ENV = import.meta.env.VITE_PRODUCTS_API;
const API =
  API_ENV || "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";
// Endpoint de categorías (para dropdown) con fallback
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
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

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
      if (!CAT_API) return; // silencioso si falta
      try {
        const res = await fetch(CAT_API);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          // Normalizamos a objetos {id,name,slug}
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
      } catch {
        // ignoramos error
      }
    };
    loadCategories();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyProduct);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || p.name || "",
      price: p.price != null ? String(p.price) : "",
      quantity:
        p.quantity != null
          ? String(p.quantity)
          : p.stock != null
          ? String(p.stock)
          : "",
      category: p.category || "",
      image: p.image || p.imageUrl || "",
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!API) return;
    setSaving(true);
    try {
      const qty = parseInt(form.quantity || 0, 10);
      const body = {
        title: form.title.trim(),
        price: parseNumber(form.price),
        quantity: qty,
        // Para compatibilidad si backend aún usa 'stock'
        stock: qty,
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
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight">Productos</h3>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-2 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
        >
          <PlusIcon className="w-5 h-5" /> Agregar
        </button>
      </div>
      {/* Mensaje de endpoint por defecto removido a pedido del usuario */}
      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Cantidad</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b last:border-b-0 border-gray-100"
              >
                <td
                  className="px-3 py-2 max-w-xs truncate"
                  title={p.title || p.name}
                >
                  {p.title || p.name}
                </td>
                <td className="px-3 py-2">
                  {formatCurrency(parseNumber(p.price))}
                </td>
                <td className="px-3 py-2">{p.quantity ?? p.stock ?? "-"}</td>
                <td className="px-3 py-2">
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
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-600"
                      aria-label="Editar"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(p)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-red-300 hover:bg-red-50 text-red-600"
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
                  className="px-3 py-6 text-center text-xs text-gray-500"
                >
                  Sin productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase">
              Título
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase">
                Precio
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase">
                Cantidad
              </label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase">
              Categoría
            </label>
            {categories.length > 0 ? (
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Ingresar categoría"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}
            {/* Mensaje de fallback de categorías eliminado a pedido del usuario */}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase">
              Imagen (URL)
            </label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
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
