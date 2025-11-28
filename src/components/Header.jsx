import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { formatNumber } from "../utils/format";
import { ShoppingCartIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

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
    <header className="sticky top-0 z-50 bg-neutral-200/90 backdrop-blur border-b border-neutral-300 shadow-sm">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
        <div className="flex items-center">
          <h1 className="m-0 text-lg sm:text-xl font-bold">
            <Link
              to="/"
              className="text-primary-500 hover:text-primary-600 transition-colors"
            >
              Mi Tienda
            </Link>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:block">
            <ul className="flex list-none m-0 p-0 gap-4 text-sm font-medium text-neutral-600">
              <li>
                <Link className="hover:text-neutral-900" to="/">
                  Inicio
                </Link>
              </li>
              <li>
                <Link className="hover:text-neutral-900" to="/about">
                  Nosotros
                </Link>
              </li>
              {user?.role === "admin" && (
                <li>
                  <Link className="hover:text-neutral-900" to="/admin">
                    Administración
                  </Link>
                </li>
              )}
              <li>
                <Link className="hover:text-neutral-900" to="/faq">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile simplified nav trigger (optional future) */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToCart}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-300 transition-colors text-neutral-900"
              aria-label={`Ir al carrito (${formatNumber(totalItems)} items)`}
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] h-[1.25rem] flex items-center justify-center">
                  {formatNumber(totalItems)}
                </span>
              )}
            </button>

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-3 py-2 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors inline-flex items-center gap-1"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Ingresar
              </Link>
            ) : (
              <div ref={menuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((s) => !s);
                  }}
                  className="w-9 h-9 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
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
                  <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-neutral-300 p-2 z-50 text-sm">
                    <div className="px-2 py-2 border-b border-neutral-200 mb-2">
                      <div className="font-semibold truncate">
                        {user?.name || user?.email}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {user?.role === "admin" ? "Administrador" : "Usuario"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
                      >
                        Perfil
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
                        >
                          Panel Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                          navigate("/");
                        }}
                        className="text-left px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
