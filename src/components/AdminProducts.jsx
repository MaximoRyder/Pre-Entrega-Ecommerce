import { useContext, useEffect, useState } from "react";
import { ToastContext } from "../context/ToastContext";

const API_BASE = "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";

const emptyForm = {
  title: "",
  description: "",
  image: "",
  price: "",
  quantity: "",
  category: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // id when editing
  const [form, setForm] = useState(emptyForm);
  const { showToast } = useContext(ToastContext);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Error al obtener productos");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      setError(e.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validateForm = () => {
    if (!form.title.trim()) return "El título es obligatorio";
    if (!form.price || isNaN(Number(form.price))) return "Precio inválido";
    if (!form.quantity || isNaN(Number(form.quantity)))
      return "Cantidad inválida";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validateForm();
    if (v) return showToast(v, 2000, "info");

    try {
      const payload = {
        title: form.title,
        description: form.description,
        image: form.image,
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category,
      };

      if (editing) {
        // update
        const res = await fetch(`${API_BASE}/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error actualizando producto");
        showToast("Producto actualizado", 1600, "success");
      } else {
        // create
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error creando producto");
        showToast("Producto creado", 1600, "success");
      }

      setForm(emptyForm);
      setEditing(null);
      await fetchProducts();
    } catch (err) {
      showToast(err.message || "Error en la operación", 2000, "danger");
    }
  };

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({
      title: p.title || "",
      description: p.description || "",
      image: p.image || "",
      price: p.price != null ? String(p.price) : "",
      quantity: p.quantity != null ? String(p.quantity) : "",
      category: p.category || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "¿Eliminar este producto? Esta acción no se puede deshacer."
    );
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error eliminando producto");
      showToast("Producto eliminado", 1400, "info");
      await fetchProducts();
    } catch (err) {
      showToast(err.message || "Error eliminando", 2000, "danger");
    }
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Administrar Productos</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <h3>{editing ? "Editar producto" : "Agregar producto"}</h3>
        <div>
          <label>
            Título (obligatorio)
            <br />
            <input name="title" value={form.title} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Descripción
            <br />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Imagen (URL)
            <br />
            <input name="image" value={form.image} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Precio (obligatorio)
            <br />
            <input name="price" value={form.price} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Cantidad (obligatorio)
            <br />
            <input
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Categoría
            <br />
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">
            {editing ? "Guardar cambios" : "Crear producto"}
          </button>
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
            <th>Título</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.title}</td>
              <td>{p.category}</td>
              <td>{p.price}</td>
              <td>{p.quantity ?? "-"}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Editar</button>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{ marginLeft: 8 }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;
