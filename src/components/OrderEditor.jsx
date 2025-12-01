import { TrashIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { ToastContext } from "../context/ToastContext";
import { formatCurrency } from "../utils/format";
import { runWithConcurrency, updateQuantityWithRetry } from "../utils/stock";
import AdminEntityModal from "./AdminEntityModal";
import ConfirmModal from "./ConfirmModal";
import QuantitySelector from "./QuantitySelector";

const API =
  import.meta.env.VITE_ORDERS_API ||
  "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/orders";

export default function OrderEditor({
  editing,
  setEditing,
  creating,
  setCreating,
  restoreOrder,
  setRestoreOrder,
  toDelete,
  setToDelete,
  refresh,
  deleteOrder,
  setOrders,
}) {
  const toastCtx = useContext(ToastContext);
  const [editDraft, setEditDraft] = useState(null);
  const [createDraft, setCreateDraft] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [userEmailError, setUserEmailError] = useState("");
  const [createUserEmailError, setCreateUserEmailError] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);
  const [createSelectedProductId, setCreateSelectedProductId] = useState("");
  const [createSelectedProductQuantity, setCreateSelectedProductQuantity] =
    useState(1);
  const [saving, setSaving] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [statusForm, setStatusForm] = useState("Pending");
  const [restoreQuantities, setRestoreQuantities] = useState({});
  const [restoreProcessing, setRestoreProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function prepareEdit() {
      if (!editing) {
        setEditDraft(null);
        return;
      }
      const draft = JSON.parse(JSON.stringify(editing));
      if (mounted) setEditDraft(draft);

      try {
        const PRODUCTS_API =
          import.meta.env.VITE_PRODUCTS_API ||
          "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";
        const res = await fetch(PRODUCTS_API);
        if (!res.ok) throw new Error("No se pudieron cargar productos");
        const prods = await res.json();
        if (mounted) setProductsList(prods || []);

        const USERS_API =
          import.meta.env.VITE_USERS_API ||
          "https://6928f88e9d311cddf347cd7f.mockapi.io/api/v1/users";
        try {
          const ures = await fetch(USERS_API);
          if (!ures.ok) throw new Error("No se pudieron cargar usuarios");
          const us = await ures.json();
          if (mounted) setUsersList(Array.isArray(us) ? us : []);
        } catch (ue) {
          console.warn("No se cargaron users para el editor de pedidos", ue);
          if (mounted) setUsersList([]);
        }
      } catch (e) {
        console.warn("No se cargaron products para el editor de pedidos", e);
        if (mounted) setProductsList([]);
      }
    }
    prepareEdit();
    return () => (mounted = false);
  }, [editing]);

  useEffect(() => {
    let mounted = true;
    async function prepareCreate() {
      if (!creating) {
        setCreateDraft(null);
        setCreateSelectedProductId("");
        return;
      }
      const draft = {
        userEmail: "",
        items: [],
        subtotal: 0,
        status: "Pending",
      };
      if (mounted) setCreateDraft(draft);

      try {
        const PRODUCTS_API =
          import.meta.env.VITE_PRODUCTS_API ||
          "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";
        const pres = await fetch(PRODUCTS_API);
        if (pres.ok) {
          const prods = await pres.json();
          if (mounted) setProductsList(prods || []);
        }

        const USERS_API =
          import.meta.env.VITE_USERS_API ||
          "https://6928f88e9d311cddf347cd7f.mockapi.io/api/v1/users";
        try {
          const ures = await fetch(USERS_API);
          if (ures.ok) {
            const us = await ures.json();
            if (mounted) setUsersList(Array.isArray(us) ? us : []);
          }
        } catch (ue) {
          console.warn("No se cargaron users para crear pedido", ue);
        }
      } catch (e) {
        console.warn("No se cargaron products para crear pedido", e);
      }
    }
    prepareCreate();
    return () => (mounted = false);
  }, [creating]);

  // Edit submit
  const handleEditSubmit = async () => {
    if (!editing || !editDraft) return;
    setSaving(true);
    let saved = false;
    try {
      const email = (editDraft.userEmail || "").trim();
      if (!email) {
        setUserEmailError("El usuario no puede quedar vacío");
        setSaving(false);
        return;
      }
      if (!usersList || usersList.length === 0) {
        try {
          const USERS_API =
            import.meta.env.VITE_USERS_API ||
            "https://6928f88e9d311cddf347cd7f.mockapi.io/api/v1/users";
          const ures = await fetch(USERS_API);
          if (ures.ok) {
            const us = await ures.json();
            setUsersList(Array.isArray(us) ? us : []);
          }
        } catch (e) {
          console.warn("No se pudo validar usuario:", e);
        }
      }
      const found = (usersList || []).some(
        (u) => String(u.email || "").toLowerCase() === email.toLowerCase()
      );
      if (!found) {
        setUserEmailError("El email no corresponde a un usuario registrado");
        setSaving(false);
        return;
      }
      const prevItems = editing.items || [];
      const newItems = editDraft.items || [];

      // Prevent saving an order without products
      if (!newItems || newItems.length === 0) {
        toastCtx.showToast(
          "No se puede guardar un pedido sin productos",
          1800,
          "error"
        );
        setSaving(false);
        return;
      }

      const ids = Array.from(
        new Set([
          ...prevItems.map((i) => String(i.id)),
          ...newItems.map((i) => String(i.id)),
        ])
      );

      // Build product map for all affected ids, then run updates with limited concurrency
      const PRODUCTS_API =
        import.meta.env.VITE_PRODUCTS_API ||
        "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";

      const fetchTasks = ids.map((id) => async () => {
        const url = `${PRODUCTS_API}/${id}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error leyendo producto ${id}`);
        const p = await res.json();
        return { id, prod: p };
      });

      const fetched = await runWithConcurrency(fetchTasks, 6);
      const prodMap = {};
      for (const r of fetched) {
        if (r && r.status === "fulfilled") {
          prodMap[String(r.value.id)] = r.value.prod;
        }
      }

      const updateTasks = [];
      for (const id of ids) {
        const prevQty = prevItems
          .filter((i) => String(i.id) === id)
          .reduce((s, it) => s + (Number(it.quantity) || 0), 0);
        const newQty = newItems
          .filter((i) => String(i.id) === id)
          .reduce((s, it) => s + (Number(it.quantity) || 0), 0);
        const delta = prevQty - newQty;
        if (delta === 0) continue;
        const prod = prodMap[String(id)];
        const available = Number(
          prod?.quantity ?? prod?.stock ?? prod?.rating?.count ?? 0
        );
        const newCount = Math.max(0, available + Number(delta));
        const url = `${PRODUCTS_API}/${id}`;
        updateTasks.push(() => updateQuantityWithRetry(url, newCount, 3, prod));
      }

      if (updateTasks.length > 0) {
        const results = await runWithConcurrency(updateTasks, 4);
        const rejected = results.find((r) => r && r.status === "rejected");
        if (rejected)
          throw (
            rejected.reason || new Error("Error updating product quantities")
          );
      }

      const payload = {
        ...editing,
        ...editDraft,
        items: newItems,
        status: statusForm,
      };
      payload.subtotal = (payload.items || []).reduce(
        (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
        0
      );

      if (String(editing.id).startsWith("local-")) {
        const local = JSON.parse(localStorage.getItem("local_orders") || "[]");
        const idx = local.findIndex((o) => o.id === editing.id);
        if (idx !== -1) {
          local[idx] = { ...local[idx], ...payload };
          localStorage.setItem("local_orders", JSON.stringify(local));
          setOrders((prev) =>
            prev.map((o) => (o.id === editing.id ? { ...o, ...payload } : o))
          );
        }
      } else {
        const putRes = await fetch(`${API}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!putRes.ok) throw new Error("Error al guardar pedido");
        await refresh();
      }

      saved = true;
      toastCtx.showToast("Pedido actualizado", 1500, "success");
    } catch (err) {
      console.error("Error actualizando pedido:", err);
      toastCtx.showToast(
        err.message || "Error actualizando pedido",
        2200,
        "error"
      );
    } finally {
      setSaving(false);
      if (saved) {
        setEditing(null);
        setEditDraft(null);
      }
    }
  };

  // Create submit
  const handleCreateSubmit = async () => {
    if (!createDraft) return;
    setCreateSaving(true);
    let saved = false;
    let prevQuantities = {};
    const PRODUCTS_API =
      import.meta.env.VITE_PRODUCTS_API ||
      "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";
    try {
      const email = (createDraft.userEmail || "").trim();
      if (!email) {
        setCreateUserEmailError("El usuario no puede quedar vacío");
        setCreateSaving(false);
        return;
      }
      if (!usersList || usersList.length === 0) {
        try {
          const USERS_API =
            import.meta.env.VITE_USERS_API ||
            "https://6928f88e9d311cddf347cd7f.mockapi.io/api/v1/users";
          const ures = await fetch(USERS_API);
          if (ures.ok) {
            const us = await ures.json();
            setUsersList(Array.isArray(us) ? us : []);
          }
        } catch (e) {
          console.warn("No se pudo validar usuario:", e);
        }
      }
      const found = (usersList || []).some(
        (u) => String(u.email || "").toLowerCase() === email.toLowerCase()
      );
      if (!found) {
        setCreateUserEmailError(
          "El email no corresponde a un usuario registrado"
        );
        setCreateSaving(false);
        return;
      }

      if (!createDraft.items || createDraft.items.length === 0) {
        toastCtx.showToast("Agrega al menos un item", 1800, "info");
        setCreateSaving(false);
        return;
      }

      // Prepare tasks to update product quantities concurrently, reusing fetched products
      const updateTasks = [];
      for (const it of createDraft.items) {
        const prod = (productsList || []).find(
          (p) => String(p.id) === String(it.id)
        );
        if (!prod) throw new Error(`Producto no encontrado: ${it.name}`);
        const available = Number(
          prod.quantity ?? prod.stock ?? prod.rating?.count ?? 0
        );
        const desired = Number(it.quantity || 1);
        if (desired > available)
          throw new Error(`Stock insuficiente para ${it.name}`);
        const newCount = Math.max(0, available - desired);
        prevQuantities[it.id] = available;
        updateTasks.push(() =>
          updateQuantityWithRetry(`${PRODUCTS_API}/${it.id}`, newCount, 3, prod)
        );
      }

      if (updateTasks.length > 0) {
        const results = await runWithConcurrency(updateTasks, 4);
        const rejected = results.find((r) => r && r.status === "rejected");
        if (rejected)
          throw (
            rejected.reason || new Error("Error updating product quantities")
          );
      }

      const payload = {
        userEmail: String(createDraft.userEmail || "").trim(),
        items: (createDraft.items || []).map((it) => ({
          id: String(it.id || ""),
          name: String(it.name || ""),
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
        })),
        subtotal: Number(createDraft.subtotal || 0),
        status: createDraft.status || "Pending",
        createdAt: new Date().toISOString(),
      };

      if (!import.meta.env.VITE_ORDERS_API) {
        const existing = JSON.parse(
          localStorage.getItem("local_orders") || "[]"
        );
        const id = `local-${Date.now()}`;
        existing.push({ ...payload, id, local: true });
        localStorage.setItem("local_orders", JSON.stringify(existing));
        setOrders((prev) => [{ ...existing[existing.length - 1] }, ...prev]);
        toastCtx.showToast("Pedido guardado localmente", 1800, "info");
      } else {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(text || "Error creando pedido");
        }
        await res.json();
        toastCtx.showToast("Pedido creado correctamente", 1500, "success");
        await refresh();
      }

      saved = true;
    } catch (err) {
      console.error("Error creando pedido:", err);
      try {
        const PRODUCTS_API =
          import.meta.env.VITE_PRODUCTS_API ||
          "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";
        for (const id of Object.keys(prevQuantities || {})) {
          try {
            const prev = prevQuantities[id];
            await updateQuantityWithRetry(`${PRODUCTS_API}/${id}`, prev);
          } catch (rbErr) {
            console.error("Rollback failed for", id, rbErr);
          }
        }
      } catch (e) {
        console.error("Error during rollback:", e);
      }
      toastCtx.showToast(err.message || "Error creando pedido", 2200, "error");
    } finally {
      setCreateSaving(false);
      if (saved) {
        setCreating(false);
        setCreateDraft(null);
        setCreateSelectedProductId("");
        setCreateSelectedProductQuantity(1);
        setCreateUserEmailError("");
      }
    }
  };

  // Restore submit
  const handleRestoreSubmit = async () => {
    if (!restoreOrder) return;
    setRestoreProcessing(true);
    const PRODUCTS_API =
      import.meta.env.VITE_PRODUCTS_API ||
      "https://692842d6b35b4ffc5014e50a.mockapi.io/api/v1/products";
    const items = restoreOrder.items || [];
    const qmap = { ...restoreQuantities };

    for (let i = 0; i < items.length; i++) {
      const key = String(i);
      if (qmap[key] == null) qmap[key] = Number(items[i].quantity) || 0;
    }

    try {
      // Fetch all products involved and run restores with concurrency
      const fetchTasks = items.map((it) => async () => {
        const url = `${PRODUCTS_API}/${it.id}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error leyendo producto ${it.id}`);
        const p = await res.json();
        return { id: it.id, prod: p };
      });

      const fetched = await runWithConcurrency(fetchTasks, 6);
      const prodMap = {};
      for (const r of fetched) {
        if (r && r.status === "fulfilled") {
          prodMap[String(r.value.id)] = r.value.prod;
        }
      }

      const updateTasks = [];
      for (let i = 0; i < items.length; i++) {
        const ret = Number(qmap[String(i)] || 0);
        if (!ret || ret <= 0) continue;
        const it = items[i];
        const prod = prodMap[String(it.id)];
        const available = Number(
          prod?.quantity ?? prod?.stock ?? prod?.rating?.count ?? 0
        );
        const newCount = Math.max(0, available + Number(ret));
        const url = `${PRODUCTS_API}/${it.id}`;
        updateTasks.push(() => updateQuantityWithRetry(url, newCount, 3, prod));
      }

      if (updateTasks.length > 0) {
        const results = await runWithConcurrency(updateTasks, 4);
        const rejected = results.find((r) => r && r.status === "rejected");
        if (rejected)
          throw (
            rejected.reason || new Error("Error updating product quantities")
          );
      }

      await deleteOrder(restoreOrder.id);
      toastCtx.showToast(
        "Stocks restaurados y pedido eliminado",
        1800,
        "success"
      );
    } catch (err) {
      console.error("Error restaurando stock:", err);
      toastCtx.showToast(
        err.message || "Error restaurando stock",
        2200,
        "error"
      );
    } finally {
      setRestoreProcessing(false);
      setRestoreOrder(null);
      setRestoreQuantities({});
    }
  };

  return (
    <>
      <AdminEntityModal
        open={!!editing}
        title={editing ? `Editar pedido #${editing.id}` : ""}
        onClose={() => {
          setEditing(null);
          setEditDraft(null);
        }}
        onSubmit={handleEditSubmit}
        submitLabel="Guardar cambios"
        loading={saving}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-sub uppercase">
              Estado
            </label>
            <select
              value={statusForm}
              onChange={(e) => setStatusForm(e.target.value)}
              className="rounded-md border border-border bg-surface text-main px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
            >
              {["Pending", "Rejected", "Processing", "Shipped"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {editDraft && (
            <div className="space-y-3">
              <div className="text-xs text-sub space-y-1">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-sub">
                    Usuario (email)
                  </label>
                  <input
                    type="text"
                    value={editDraft.userEmail || ""}
                    onChange={(e) => {
                      setEditDraft((prev) => ({
                        ...(prev || {}),
                        userEmail: e.target.value,
                      }));
                      setUserEmailError("");
                    }}
                    className="mt-1 rounded-md border border-border bg-surface text-main px-3 py-2 text-sm"
                  />
                  {userEmailError && (
                    <p className="text-xs text-red-500 mt-1">
                      {userEmailError}
                    </p>
                  )}
                </div>
                <p>
                  <strong>Subtotal:</strong>{" "}
                  {formatCurrency(editDraft.subtotal || 0)}
                </p>
                <p>
                  <strong>Items:</strong>{" "}
                  {(editDraft.items || []).reduce(
                    (s, it) => s + (Number(it.quantity || 1) || 0),
                    0
                  )}
                </p>
              </div>

              <div className="space-y-2">
                {(editDraft.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded-md p-4 min-h-[72px]"
                  >
                    <div className="flex-1 min-w-0 w-full">
                      <div className="font-medium" title={it.name}>
                        {it.name}
                      </div>
                      <div className="text-xs text-sub mt-2">
                        Precio unitario: {formatCurrency(it.price)}
                      </div>
                      <div className="text-xs text-sub mt-1">
                        Valor total:{" "}
                        {formatCurrency(
                          (Number(it.price) || 0) * (Number(it.quantity) || 0)
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <QuantitySelector
                        value={Number(it.quantity) || 1}
                        onChange={(v) => {
                          setEditDraft((prev) => {
                            const next = JSON.parse(JSON.stringify(prev));
                            next.items[idx].quantity = v;
                            next.subtotal = (next.items || []).reduce(
                              (s, it2) =>
                                s +
                                (Number(it2.price) || 0) *
                                  (Number(it2.quantity) || 0),
                              0
                            );
                            return next;
                          });
                        }}
                        min={1}
                        max={(() => {
                          try {
                            const prod = productsList.find(
                              (p) => String(p.id) === String(it.id)
                            );
                            const available = Number(
                              prod?.quantity ??
                                prod?.stock ??
                                prod?.rating?.count ??
                                0
                            );
                            const prevQty = (editing?.items || [])
                              .filter((x) => String(x.id) === String(it.id))
                              .reduce(
                                (s, it2) => s + (Number(it2.quantity) || 0),
                                0
                              );
                            const allowed = Math.max(
                              0,
                              available + Number(prevQty || 0)
                            );
                            return Math.max(allowed, Number(prevQty || 0));
                          } catch (e) {
                            console.warn(e);
                            return 99999;
                          }
                        })()}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditDraft((prev) => {
                            const next = JSON.parse(JSON.stringify(prev));
                            next.items = (next.items || []).filter(
                              (_, i) => i !== idx
                            );
                            next.subtotal = (next.items || []).reduce(
                              (s, it2) =>
                                s +
                                (Number(it2.price) || 0) *
                                  (Number(it2.quantity) || 0),
                              0
                            );
                            return next;
                          });
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-red-300 hover:bg-red-900/20 text-red-500"
                        aria-label="Eliminar item"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border">
                <label className="text-xs font-medium text-sub">
                  Agregar producto
                </label>
                <div className="mt-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setSelectedProductQuantity(1);
                    }}
                    className="w-full rounded-md border border-border bg-surface text-main px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar producto...</option>
                    {(() => {
                      const availableProducts = (productsList || []).filter(
                        (p) => {
                          const alreadyInDraft = (editDraft?.items || []).some(
                            (it) => String(it.id) === String(p.id)
                          );
                          const available = Number(
                            p.quantity ?? p.stock ?? p.rating?.count ?? 0
                          );
                          return !alreadyInDraft && available > 0;
                        }
                      );
                      if (availableProducts.length === 0)
                        return (
                          <option value="" disabled>
                            No hay productos disponibles
                          </option>
                        );
                      return availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {(p.title || p.name) +
                            " - " +
                            formatCurrency(Number(p.price) || 0)}
                        </option>
                      ));
                    })()}
                  </select>

                  <div className="mt-2 flex items-center gap-2">
                    <QuantitySelector
                      value={selectedProductQuantity}
                      onChange={(v) =>
                        setSelectedProductQuantity(Number(v) || 0)
                      }
                      min={1}
                      max={(() => {
                        const prod = productsList.find(
                          (p) => String(p.id) === String(selectedProductId)
                        );
                        if (!prod) return 1;
                        return Math.max(
                          0,
                          Number(
                            prod.quantity ??
                              prod.stock ??
                              prod.rating?.count ??
                              0
                          )
                        );
                      })()}
                    />

                    <div className="ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedProductId) return;
                          const prod = productsList.find(
                            (p) => String(p.id) === String(selectedProductId)
                          );
                          if (!prod) return;
                          const available = Number(
                            prod.quantity ??
                              prod.stock ??
                              prod.rating?.count ??
                              0
                          );
                          const addQty = Number(selectedProductQuantity) || 0;
                          if (addQty <= 0) return;
                          if (addQty > available) {
                            toastCtx.showToast(
                              `No hay suficiente stock. Disponible: ${available}`,
                              2200,
                              "error"
                            );
                            return;
                          }
                          setEditDraft((prev) => {
                            const next = JSON.parse(
                              JSON.stringify(prev || { items: [] })
                            );
                            next.items = next.items || [];
                            const existingIdx = next.items.findIndex(
                              (i) => String(i.id) === String(prod.id)
                            );
                            if (existingIdx !== -1) {
                              toastCtx.showToast(
                                "El producto ya está en el pedido. Modifica la cantidad existente.",
                                2200,
                                "info"
                              );
                              return prev;
                            }
                            next.items.push({
                              id: prod.id,
                              name: prod.title || prod.name,
                              price: Number(prod.price) || 0,
                              quantity: addQty,
                            });
                            next.subtotal = (next.items || []).reduce(
                              (s, it2) =>
                                s +
                                (Number(it2.price) || 0) *
                                  (Number(it2.quantity) || 0),
                              0
                            );
                            return next;
                          });
                          setSelectedProductId("");
                          setSelectedProductQuantity(1);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-3 py-2"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminEntityModal>

      <AdminEntityModal
        open={!!creating}
        title={creating ? `Crear nuevo pedido` : ""}
        onClose={() => {
          setCreating(false);
          setCreateDraft(null);
          setCreateUserEmailError("");
        }}
        onSubmit={handleCreateSubmit}
        submitLabel="Crear pedido"
        loading={createSaving}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-sub uppercase">
              Estado
            </label>
            <select
              value={createDraft?.status || "Pending"}
              onChange={(e) =>
                setCreateDraft((prev) => ({
                  ...(prev || {}),
                  status: e.target.value,
                }))
              }
              className="rounded-md border border-border bg-surface text-main px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-main"
            >
              {["Pending", "Rejected", "Processing", "Shipped"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {createDraft && (
            <div className="space-y-3">
              <div className="text-xs text-sub space-y-1">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-sub">
                    Usuario (email)
                  </label>
                  <input
                    type="text"
                    value={createDraft.userEmail || ""}
                    onChange={(e) => {
                      setCreateDraft((prev) => ({
                        ...(prev || {}),
                        userEmail: e.target.value,
                      }));
                      setCreateUserEmailError("");
                    }}
                    className="mt-1 rounded-md border border-border bg-surface text-main px-3 py-2 text-sm"
                  />
                  {createUserEmailError && (
                    <p className="text-xs text-red-500 mt-1">
                      {createUserEmailError}
                    </p>
                  )}
                </div>
                <p>
                  <strong>Subtotal:</strong>{" "}
                  {formatCurrency(createDraft.subtotal || 0)}
                </p>
                <p>
                  <strong>Items:</strong>{" "}
                  {(createDraft.items || []).reduce(
                    (s, it) => s + (Number(it.quantity || 1) || 0),
                    0
                  )}
                </p>
              </div>

              <div className="space-y-2">
                {(createDraft.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded-md p-4 min-h-[72px]"
                  >
                    <div className="flex-1 min-w-0 w-full">
                      <div className="font-medium" title={it.name}>
                        {it.name}
                      </div>
                      <div className="text-xs text-sub mt-2">
                        Precio unitario: {formatCurrency(it.price)}
                      </div>
                      <div className="text-xs text-sub mt-1">
                        Valor total:{" "}
                        {formatCurrency(
                          (Number(it.price) || 0) * (Number(it.quantity) || 0)
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <QuantitySelector
                        value={Number(it.quantity) || 1}
                        onChange={(v) => {
                          setCreateDraft((prev) => {
                            const next = JSON.parse(JSON.stringify(prev));
                            next.items[idx].quantity = v;
                            next.subtotal = (next.items || []).reduce(
                              (s, it2) =>
                                s +
                                (Number(it2.price) || 0) *
                                  (Number(it2.quantity) || 0),
                              0
                            );
                            return next;
                          });
                        }}
                        min={1}
                        stock={(() => {
                          const p = (productsList || []).find(
                            (p) => String(p.id) === String(it.id)
                          );
                          return Number(
                            p?.quantity ?? p?.stock ?? p?.rating?.count ?? 0
                          );
                        })()}
                        existing={0}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCreateDraft((prev) => {
                            const next = JSON.parse(JSON.stringify(prev));
                            next.items = (next.items || []).filter(
                              (_, i) => i !== idx
                            );
                            next.subtotal = (next.items || []).reduce(
                              (s, it2) =>
                                s +
                                (Number(it2.price) || 0) *
                                  (Number(it2.quantity) || 0),
                              0
                            );
                            return next;
                          });
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-red-300 hover:bg-red-900/20 text-red-500"
                        aria-label="Eliminar item"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border">
                <label className="text-xs font-medium text-sub">
                  Agregar producto
                </label>
                <div className="mt-2">
                  <select
                    value={createSelectedProductId}
                    onChange={(e) => {
                      setCreateSelectedProductId(e.target.value);
                      setCreateSelectedProductQuantity(1);
                    }}
                    className="w-full rounded-md border border-border bg-surface text-main px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar producto...</option>
                    {(() => {
                      const availableProducts = (productsList || []).filter(
                        (p) => {
                          const alreadyInDraft = (
                            createDraft?.items || []
                          ).some((it) => String(it.id) === String(p.id));
                          const available = Number(
                            p.quantity ?? p.stock ?? p.rating?.count ?? 0
                          );
                          return !alreadyInDraft && available > 0;
                        }
                      );
                      if (availableProducts.length === 0)
                        return (
                          <option value="" disabled>
                            No hay productos disponibles
                          </option>
                        );
                      return availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {(p.title || p.name) +
                            " - " +
                            formatCurrency(Number(p.price) || 0)}
                        </option>
                      ));
                    })()}
                  </select>

                  <div className="mt-2 flex items-center gap-2">
                    <QuantitySelector
                      value={createSelectedProductQuantity}
                      onChange={(v) =>
                        setCreateSelectedProductQuantity(Number(v) || 0)
                      }
                      min={1}
                      max={(() => {
                        const prod = productsList.find(
                          (p) =>
                            String(p.id) === String(createSelectedProductId)
                        );
                        if (!prod) return 1;
                        return Math.max(
                          0,
                          Number(
                            prod.quantity ??
                              prod.stock ??
                              prod.rating?.count ??
                              0
                          )
                        );
                      })()}
                    />

                    <div className="ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          if (!createSelectedProductId) return;
                          const prod = productsList.find(
                            (p) =>
                              String(p.id) === String(createSelectedProductId)
                          );
                          if (!prod) return;
                          const available = Number(
                            prod.quantity ??
                              prod.stock ??
                              prod.rating?.count ??
                              0
                          );
                          const addQty =
                            Number(createSelectedProductQuantity) || 0;
                          if (addQty <= 0) return;
                          if (addQty > available) {
                            toastCtx.showToast(
                              `No hay suficiente stock. Disponible: ${available}`,
                              2200,
                              "error"
                            );
                            return;
                          }
                          setCreateDraft((prev) => {
                            const next = JSON.parse(
                              JSON.stringify(prev || { items: [] })
                            );
                            next.items = next.items || [];
                            const existingIdx = next.items.findIndex(
                              (i) => String(i.id) === String(prod.id)
                            );
                            if (existingIdx !== -1) {
                              toastCtx.showToast(
                                "El producto ya está en el pedido. Modifica la cantidad existente.",
                                2200,
                                "info"
                              );
                              return prev;
                            }
                            next.items.push({
                              id: prod.id,
                              name: prod.title || prod.name,
                              price: Number(prod.price) || 0,
                              quantity: addQty,
                            });
                            next.subtotal = (next.items || []).reduce(
                              (s, it2) =>
                                s +
                                (Number(it2.price) || 0) *
                                  (Number(it2.quantity) || 0),
                              0
                            );
                            return next;
                          });
                          setCreateSelectedProductId("");
                          setCreateSelectedProductQuantity(1);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-3 py-2"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminEntityModal>

      <AdminEntityModal
        open={!!restoreOrder}
        title={
          restoreOrder ? `Restaurar stock - Pedido #${restoreOrder.id}` : ""
        }
        onClose={() => {
          setRestoreOrder(null);
          setRestoreQuantities({});
        }}
        onSubmit={handleRestoreSubmit}
        submitLabel="Restaurar y eliminar"
        loading={restoreProcessing}
        loadingLabel="Procesando..."
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-sub">
            Ajusta la cantidad a devolver por cada producto. Por defecto se
            rellena con la cantidad del pedido.
          </p>
          {restoreOrder && (restoreOrder.items || []).length === 0 && (
            <p className="text-sm text-sub">Este pedido no tiene items.</p>
          )}
          {restoreOrder && (restoreOrder.items || []).length > 0 && (
            <div className="space-y-3">
              {(restoreOrder.items || []).map((it, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-md p-4 min-h-[72px]"
                >
                  <div className="flex-1 min-w-0 w-full">
                    <div className="font-medium" title={it.name}>
                      {it.name}
                    </div>
                    <div className="text-xs text-sub">
                      Cantidad en pedido: {it.quantity}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end">
                    <QuantitySelector
                      value={
                        (restoreQuantities[String(idx)] ??
                          Number(it.quantity)) ||
                        0
                      }
                      onChange={(v) =>
                        setRestoreQuantities((prev) => ({ ...prev, [idx]: v }))
                      }
                      min={0}
                      max={Number(it.quantity) || 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminEntityModal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          // Prefill restore modal with quantities from the order and open it
          try {
            const items = toDelete.items || [];
            const qmap = {};
            for (let i = 0; i < items.length; i++) {
              qmap[String(i)] = Number(items[i].quantity) || 0;
            }
            setRestoreQuantities(qmap);
            setRestoreOrder(toDelete);
            // close the simple confirm
            setToDelete(null);
          } catch (err) {
            console.error("Error preparando restauración:", err);
            toastCtx.showToast(
              err.message || "Error preparando restauración",
              2200,
              "error"
            );
          }
        }}
        title="Eliminar pedido"
        message={
          toDelete
            ? `Eliminar pedido #${toDelete.id}? Al confirmar se abrirá un modal para devolver stock antes de eliminar.`
            : ""
        }
        cancelText="Cancelar"
        confirmText="Restaurar stock"
      />
    </>
  );
}
