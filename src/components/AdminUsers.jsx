import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/validators";
import AdminEntityModal from "./AdminEntityModal";
import ConfirmModal from "./ConfirmModal";
import FormField from "./FormField";
import Pagination from "./Pagination";
import SearchForm from "./SearchForm";

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
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(lower) || email.includes(lower);
  });

  const showingAllMatches = !!searchTerm;
  const displayedUsers = showingAllMatches
    ? filteredUsers
    : users.slice((page - 1) * pageSize, page * pageSize);

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
      password: "",
    });
    setModalOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    const nameError = validateName(form.name, 5, 100);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(form.email, 5, 100);
    if (emailError) newErrors.email = emailError;

    if (!editing) {
      const passwordError = validatePassword(form.password, 4, 20);
      if (passwordError) newErrors.password = passwordError;
    } else if (form.password && form.password.trim() !== "") {
      const passwordError = validatePassword(form.password, 4, 20);
      if (passwordError) newErrors.password = passwordError;
    }

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
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };
      if (form.password && form.password.trim() !== "") {
        body.password = form.password.trim();
      }
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
      <div className="hidden md:flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight">Usuarios</h3>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-3 py-2 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
        >
          <PlusIcon className="w-5 h-5" /> Agregar
        </button>
      </div>

      <SearchForm
        onSearch={(term) => {
          setSearchTerm(term);
          setPage(1);
        }}
        initialValue={searchTerm}
        placeholder="Buscar por nombre o email..."
      />

      <div className="md:hidden">
        <button
          onClick={openNew}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-3 py-2 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
        >
          <PlusIcon className="w-5 h-5" /> Agregar
        </button>
      </div>

      {loading && <p className="text-sm text-muted">Cargando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm hidden md:block">
        <table className="w-full text-xs sm:text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-[10px] sm:text-xs uppercase tracking-wide text-muted border-b border-border">
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Nombre</th>
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Email</th>
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Rol</th>
              <th className="px-2 py-1.5 sm:px-3 sm:py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0 border-border">
                <td
                  className="px-2 py-1.5 sm:px-3 sm:py-2 max-w-[140px] truncate"
                  title={u.name}
                >
                  {u.name}
                </td>
                <td
                  className="px-2 py-1.5 sm:px-3 sm:py-2 text-sub truncate"
                  title={u.email}
                >
                  {u.email}
                </td>
                <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                  {u.role || "user"}
                </td>
                <td className="px-2 py-1.5 sm:px-3 sm:py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-surface-hover text-sub"
                      aria-label="Editar"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(u)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-red-500 hover:bg-red-500/10"
                      aria-label="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && !loading && !error && (
              <tr>
                <td
                  colSpan={4}
                  className="px-2 py-6 text-center text-[10px] sm:text-xs text-muted"
                >
                  Sin usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!showingAllMatches && (
        <div className="hidden md:block mt-3">
          <Pagination
            page={page}
            totalPages={Math.max(1, Math.ceil(filteredUsers.length / pageSize))}
            onPageChange={setPage}
          />
        </div>
      )}

      <div className="md:hidden space-y-3">
        {displayedUsers.map((u) => (
          <div
            key={u.id}
            className="border border-border rounded-md bg-surface shadow-sm px-3 py-2 text-sm"
          >
            <div className="flex">
              <span className="font-semibold mr-1">Nombre:</span>
              <span className="flex-1 truncate" title={u.name}>
                {u.name}
              </span>
            </div>
            <div className="border-t border-border pt-1 mt-1 flex">
              <span className="font-semibold mr-1">Email:</span>
              <span className="flex-1 truncate" title={u.email}>
                {u.email}
              </span>
            </div>
            <div className="border-t border-border pt-1 mt-1 flex">
              <span className="font-semibold mr-1">Rol:</span>
              <span className="flex-1">{u.role || "user"}</span>
            </div>
            <div className="border-t border-border mt-2 pt-2 flex items-center gap-2">
              <span className="font-semibold">Acciones:</span>
              <button
                onClick={() => openEdit(u)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border hover:bg-surface-hover text-sub"
                aria-label="Editar"
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => confirmDelete(u)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-red-500 hover:bg-red-500/10"
                aria-label="Eliminar"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && !loading && !error && (
          <div className="text-center text-sm text-muted py-6 border border-dashed border-border rounded-md">
            Sin usuarios
          </div>
        )}
      </div>
      {!showingAllMatches && (
        <div className="md:hidden mt-2">
          <Pagination
            page={page}
            totalPages={Math.max(1, Math.ceil(filteredUsers.length / pageSize))}
            onPageChange={setPage}
          />
        </div>
      )}

      <AdminEntityModal
        open={modalOpen}
        title={editing ? "Editar usuario" : "Agregar usuario"}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
        submitLabel={editing ? "Guardar cambios" : "Crear"}
        loading={saving}
      >
        <div className="grid gap-4">
          <FormField label="Nombre" htmlFor="admin-name" error={errors.name}>
            <input
              id="admin-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              required
              className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.name ? "border-red-500" : "border-border"
              }`}
            />
          </FormField>

          <FormField label="Email" htmlFor="admin-email" error={errors.email}>
            <input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              required
              className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.email ? "border-red-500" : "border-border"
              }`}
            />
          </FormField>

          <FormField label="Rol" htmlFor="admin-role">
            <select
              id="admin-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-md border border-border bg-surface text-main px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>

          <FormField
            label="Contraseña"
            htmlFor="admin-password"
            error={errors.password}
          >
            <input
              id="admin-password"
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              required={!editing}
              placeholder={
                editing
                  ? "(Opcional, dejar en blanco para no cambiar)"
                  : undefined
              }
              className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.password ? "border-red-500" : "border-border"
              }`}
            />
          </FormField>
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
