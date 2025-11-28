import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import AdminEntityModal from "./AdminEntityModal";
import ConfirmModal from "./ConfirmModal";

// Endpoint de usuarios (env o fallback)
const USERS_API_ENV = import.meta.env.VITE_USERS_API;
const API =
  USERS_API_ENV || "https://6928f88e9d311cddf347cd7f.mockapi.io/api/v1/users";

const emptyUser = { name: "", email: "", role: "user", password: "" };

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyUser);
    setModalOpen(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "user",
      password: "", // blank: optional change
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!API) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };
      if (!editing) body.password = form.password.trim();
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
      if (!res.ok) throw new Error("Error guardando usuario");
      await load();
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (u) => setDeleting(u);
  const doDelete = async () => {
    if (!API || !deleting) return;
    try {
      const res = await fetch(`${API}/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando usuario");
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
        <h3 className="text-xl font-semibold tracking-tight">Usuarios</h3>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-2 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
        >
          <PlusIcon className="w-5 h-5" /> Agregar
        </button>
      </div>
      {/* Mensaje de advertencia eliminado a pedido del usuario */}
      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b last:border-b-0 border-gray-100"
              >
                <td className="px-3 py-2 max-w-xs truncate" title={u.name}>
                  {u.name}
                </td>
                <td
                  className="px-3 py-2 text-gray-600 truncate"
                  title={u.email}
                >
                  {u.email}
                </td>
                <td className="px-3 py-2">{u.role || "user"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-600"
                      aria-label="Editar"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(u)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-red-300 hover:bg-red-50 text-red-600"
                      aria-label="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && !error && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-xs text-gray-500"
                >
                  Sin usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminEntityModal
        open={modalOpen}
        title={editing ? "Editar usuario" : "Agregar usuario"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
        submitLabel={editing ? "Guardar cambios" : "Crear"}
        loading={saving}
      >
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase">
              Nombre
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase">
              Rol
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {!editing && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase">
                Contraseña
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>
      </AdminEntityModal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        title="Eliminar usuario"
        message={
          deleting ? `¿Eliminar "${deleting.name || deleting.email}"?` : ""
        }
        cancelText="Cancelar"
        confirmText="Eliminar"
      />
    </div>
  );
};

export default AdminUsers;
