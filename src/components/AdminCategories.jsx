import { useContext, useEffect, useState } from "react";
import { ToastContext } from "../context/ToastContext";

const API_BASE =
  "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/categories";
const PRODUCTS_API =
  "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";

const emptyForm = { name: "" };

const AdminCategories = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { showToast } = useContext(ToastContext);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Error al obtener categorías");
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError(e.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name || !form.name.trim()) return "El nombre es obligatorio";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return showToast(v, 2000, "info");

    try {
      const payload = { name: form.name };
      if (editing) {
        const existing = items.find((it) => it && it.id === editing);
        const oldName = existing ? existing.name || existing.title || "" : "";

        const res = await fetch(`${API_BASE}/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error actualizando categoría");
        let updatedCount = 0;
        if (oldName && oldName !== payload.name) {
          try {
            const pr = await fetch(PRODUCTS_API);
            if (pr.ok) {
              const all = await pr.json();
              const toUpdate = all.filter((p) => {
                const cat = p.category;

                return (
                  String(cat || "")
                    .trim()
                    .toLowerCase() === String(oldName).trim().toLowerCase() &&
                  String(cat || "").trim() !== String(editing).trim()
                );
              });
              for (const prod of toUpdate) {
                const newProd = { ...prod, category: editing };
                const upr = await fetch(`${PRODUCTS_API}/${prod.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newProd),
                });
                if (upr.ok) updatedCount++;
              }
            }
          } catch (syncErr) {
            console.warn(
              "Error sincronizando productos con nueva categoría:",
              syncErr
            );
          }
        }

        showToast(
          `Categoría actualizada${
            updatedCount ? ` — ${updatedCount} producto(s) migrados a id` : ""
          }`,
          1800,
          "success"
        );
      } else {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error creando categoría");
        showToast("Categoría creada", 1400, "success");
      }
      setForm(emptyForm);
      setEditing(null);
      await fetchItems();
    } catch (err) {
      showToast(err.message || "Error en la operación", 2000, "danger");
    }
  };

  const handleEdit = (it) => {
    setEditing(it.id);
    const name = typeof it === "string" ? it : it.name || it.title || "";
    setForm({ name });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      const pr = await fetch(PRODUCTS_API);
      let referenced = 0;
      if (pr.ok) {
        const all = await pr.json();
        const catItem = items.find((it) => it && it.id === id);
        const catName = catItem ? catItem.name || catItem.title || "" : "";
        referenced = all.filter((p) => {
          const cat = p.category;
          return (
            String(cat || "").trim() === String(id).trim() ||
            String(cat || "")
              .trim()
              .toLowerCase() === String(catName).trim().toLowerCase()
          );
        }).length;
      }

      if (referenced > 0) {
        const confirmMsg = `Hay ${referenced} producto(s) que referencian esta categoría. ¿Eliminar de todas formas?`;
        const ok = window.confirm(confirmMsg);
        if (!ok) return;
      } else {
        const ok = window.confirm("¿Eliminar esta categoría?");
        if (!ok) return;
      }

      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando categoría");
      showToast("Categoría eliminada", 1400, "info");
      await fetchItems();
    } catch (err) {
      showToast(err.message || "Error eliminando", 2000, "danger");
    }
  };

  if (loading) return <p>Cargando categorías...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Administrar Categorías</h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
        <label>
          Nombre
          <br />
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <div style={{ marginTop: 8 }}>
          <button type="submit">{editing ? "Guardar" : "Crear"}</button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
              }}
              style={{ marginLeft: 8 }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <table
        border="1"
        cellPadding="6"
        cellSpacing="0"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const name =
              typeof it === "string" ? it : it.name || it.title || "";
            const id = typeof it === "string" ? name : it.id;
            return (
              <tr key={id}>
                <td>{id}</td>
                <td>{name}</td>
                <td>
                  <button onClick={() => handleEdit(it)}>Editar</button>
                  {typeof it !== "string" && (
                    <button
                      onClick={() => handleDelete(it.id)}
                      style={{ marginLeft: 8 }}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCategories;
