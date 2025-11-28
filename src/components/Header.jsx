import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "../styles/Header.css";
import { formatNumber } from "../utils/format";

const Header = () => {
  const { cart } = useContext(CartContext);
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const goToCart = () => navigate("/cart");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

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
            {user?.role === "admin" && (
              <li>
                <Link to="/admin">Administración</Link>
              </li>
            )}
            {!isAuthenticated ? (
              <li>
                <Link to="/login">Ingresar</Link>
              </li>
            ) : (
              <li
                ref={menuRef}
                className="user-badge-li"
                style={{ position: "relative" }}
              >
                <button
                  className="user-badge"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((s) => !s);
                  }}
                >
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .toUpperCase()
                    : (user?.email || "U")[0].toUpperCase()}
                </button>
                {menuOpen && (
                  <div
                    className="user-menu"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      zIndex: 60,
                      minWidth: 200,
                      background: "white",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                      borderRadius: 6,
                      padding: 10,
                    }}
                  >
                    <div
                      style={{
                        padding: "6px 8px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {user?.name || user?.email}
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {user?.role === "admin" ? "Administrador" : "Usuario"}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        marginTop: 8,
                      }}
                    >
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        style={{ padding: "6px 8px" }}
                      >
                        Perfil
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          style={{ padding: "6px 8px" }}
                        >
                          Panel Admin
                        </Link>
                      )}
                      <button
                        className="btn-link"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                          navigate("/");
                        }}
                        style={{
                          textAlign: "left",
                          padding: "6px 8px",
                          border: "none",
                          background: "transparent",
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
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
