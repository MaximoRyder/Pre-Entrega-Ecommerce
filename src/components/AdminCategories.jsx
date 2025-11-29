import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import AdminEntityModal from "./AdminEntityModal";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";

// Endpoint de categorías: usa env si está, sino fallback al mockapi
const API_ENV = import.meta.env.VITE_CATEGORIES_API;
const API =
  API_ENV || "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/categories";

const emptyCategory = { name: "" };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCategory);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    if (!API) return; // silent if endpoint missing
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error cargando categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyCategory);
    setModalOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name || "" });
    setModalOpen(true);
  };

  const slugify = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 60);

  const save = async () => {
    if (!API) return;
    setSaving(true);
    try {
      const body = { name: form.name.trim(), slug: slugify(form.name.trim()) };
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
      if (!res.ok) throw new Error("Error guardando categoría");
      await load();
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (c) => setDeleting(c);
  const doDelete = async () => {
    if (!API || !deleting) return;
    try {
      const res = await fetch(`${API}/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando categoría");
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
        <h3 className="text-xl font-semibold tracking-tight">Categorías</h3>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-3 py-2 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
        >
          <PlusIcon className="w-5 h-5" /> Agregar
        </button>
      </div>
      {/* Mensaje de advertencia eliminado a pedido del usuario */}
      {loading && <p className="text-sm text-muted">Cargando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm hidden md:block">
        <table className="w-full text-xs sm:text-sm min-w-[420px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wide text-muted border-b border-border">
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Nombre</th>
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories
              .slice((page - 1) * pageSize, page * pageSize)
              .map((c) => (
                <tr
                  key={c.id}
                  className="border-b last:border-b-0 border-border"
                >
                  <td
                    className="px-2 py-1.5 sm:px-3 sm:py-2 max-w-[160px] truncate"
                    title={c.name}
                  >
                    {c.name}
                  </td>
                  <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-surface-hover text-sub"
                        aria-label="Editar"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(c)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-red-500 hover:bg-red-500/10"
                        aria-label="Eliminar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {categories.length === 0 && !loading && !error && (
              <tr>
                <td
                  colSpan={2}
                  className="px-2 py-6 text-center text-[10px] sm:text-xs text-muted"
                >
                  Sin categorías
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="hidden md:block mt-3">
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(categories.length / pageSize))}
          onPageChange={setPage}
        />
      </div>

      {/* Vista móvil tipo tarjeta/lista */}
      <div className="md:hidden space-y-3">
        {categories.slice((page - 1) * pageSize, page * pageSize).map((c) => (
          <div
            key={c.id}
            className="border border-border rounded-md bg-surface shadow-sm px-3 py-2 text-sm"
          >
            <div className="flex">
              <span className="font-semibold mr-1">Nombre:</span>
              <span className="flex-1 truncate" title={c.name}>
                {c.name}
              </span>
            </div>
            <div className="border-t border-border mt-2 pt-2 flex items-center gap-2">
              <span className="font-semibold">Acciones:</span>
              <button
                onClick={() => openEdit(c)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-surface-hover text-sub"
                aria-label="Editar"
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => confirmDelete(c)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-red-500 hover:bg-red-500/10"
                aria-label="Eliminar"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && !loading && !error && (
          <div className="text-center text-sm text-muted py-6 border border-dashed border-border rounded-md">
            Sin categorías
          </div>
        )}
      </div>
      <div className="md:hidden mt-2">
        <Pagination
          page={page}
          totalPages={Math.max(1, Math.ceil(categories.length / pageSize))}
          onPageChange={setPage}
        />
      </div>

      <AdminEntityModal
        open={modalOpen}
        title={editing ? "Editar categoría" : "Agregar categoría"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
        submitLabel={editing ? "Guardar cambios" : "Crear"}
        loading={saving}
      >
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-sub uppercase">
              Nombre
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-main"
            />
          </div>
          {/* Campo slug removido; se genera automáticamente */}
        </div>
      </AdminEntityModal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        title="Eliminar categoría"
        message={deleting ? `¿Eliminar "${deleting.name}"?` : ""}
        cancelText="Cancelar"
        confirmText="Eliminar"
      />
    </div>
  );
};

export default AdminCategories;
