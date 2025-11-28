import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "../styles/Header.css";
import { formatNumber } from "../utils/format";

const Header = () => {
  const { cart } = useContext(CartContext);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const goToCart = () => navigate("/cart");

  const totalItems = cart.reduce((s, i) => s + (i.quantity || 1), 0);

  return (
    <header className="header">
      <div className="brand">
        <h1>
          <Link to="/">Mi Tienda</Link>
        </h1>
      </div>

      <div className="right-actions">
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/about">Nosotros</Link>
            </li>
            {!isAuthenticated ? (
              <li>
                <Link to="/login">Ingresar</Link>
              </li>
            ) : (
              <li>
                <button
                  className="btn-link"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Cerrar sesión
                </button>
              </li>
            )}
            <li>
              <Link to="/faq">Preguntas Frecuentes</Link>
            </li>
          </ul>
        </nav>

        <button
          className="btn cart-button"
          data-variant="secondary"
          data-visual="ghost"
          onClick={goToCart}
          aria-label={`Ir al carrito (${formatNumber(totalItems)} items)`}
        >
          <span className="material-symbols-rounded">shopping_cart</span>
          {totalItems > 0 && (
            <span className="cart-badge">{formatNumber(totalItems)}</span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
