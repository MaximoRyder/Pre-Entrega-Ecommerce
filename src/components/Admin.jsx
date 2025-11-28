import AdminCategories from "./AdminCategories";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";

const Admin = () => {
  return (
    <main style={{ padding: 24 }}>
      <h2>Panel de administración</h2>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 24 }}
      >
        <div>
          <AdminProducts />
          <div style={{ marginTop: 24 }}>
            <AdminOrders />
          </div>
        </div>
        <aside>
          <AdminCategories />
        </aside>
      </div>
    </main>
  );
};

export default Admin;
