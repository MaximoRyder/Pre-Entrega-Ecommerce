import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import About from "./components/About";
import CartPage from "./components/CartPage";
import FAQ from "./components/FAQ";
import Home from "./components/Home";
import Layout from "./components/Layout";
import ProductDetail from "./components/ProductDetail";
import { CartProvider } from "./context/CartContext";
import { FilterProvider } from "./context/FilterProvider";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <CartProvider>
      <FilterProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="cart" element={<CartPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </FilterProvider>
    </CartProvider>
  );
}

export default App;
