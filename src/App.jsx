import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./components/About";
import Admin from "./components/Admin";
import AdminCategories from "./components/AdminCategories";
import AdminOrders from "./components/AdminOrders";
import AdminProducts from "./components/AdminProducts";
import AdminUsers from "./components/AdminUsers";
import CartPage from "./components/CartPage";
import FAQ from "./components/FAQ";
import Home from "./components/Home";
import Layout from "./components/Layout";
import Login from "./components/Login";
import ProductDetail from "./components/ProductDetail";
import Register from "./components/Register";
import RequireAdmin from "./components/RequireAdmin";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FilterProvider } from "./context/FilterProvider";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FilterProvider>
          <ToastProvider>
            <BrowserRouter basename="/Pre-Entrega-Ecommerce/">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route
                    path="admin"
                    element={
                      <RequireAdmin>
                        <Admin />
                      </RequireAdmin>
                    }
                  >
                    <Route index element={<AdminProducts />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>
                  <Route path="faq" element={<FAQ />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="cart" element={<CartPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </FilterProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
