import {
  Bars3Icon,
  ClipboardDocumentListIcon,
  CubeIcon,
  TagIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const linkBase =
  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";

const Admin = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const section = pathname.split("/").pop();
  const titleMap = {
    products: "Productos",
    categories: "Categorías",
    orders: "Pedidos",
    users: "Usuarios",
  };
  const currentTitle = titleMap[section] || "Administración";
  const navLinks = (
    <nav className="flex flex-col gap-1" onClick={() => setOpen(false)}>
      <NavLink
        to="products"
        className={({ isActive }) =>
          linkBase +
          (isActive
            ? " bg-primary-600 text-white shadow-sm"
            : " text-gray-700 hover:bg-gray-100")
        }
      >
        <CubeIcon className="w-5 h-5" /> Productos
      </NavLink>
      <NavLink
        to="categories"
        className={({ isActive }) =>
          linkBase +
          (isActive
            ? " bg-primary-600 text-white shadow-sm"
            : " text-gray-700 hover:bg-gray-100")
        }
      >
        <TagIcon className="w-5 h-5" /> Categorías
      </NavLink>
      <NavLink
        to="orders"
        className={({ isActive }) =>
          linkBase +
          (isActive
            ? " bg-primary-600 text-white shadow-sm"
            : " text-gray-700 hover:bg-gray-100")
        }
      >
        <ClipboardDocumentListIcon className="w-5 h-5" /> Órdenes
      </NavLink>
      <NavLink
        to="users"
        className={({ isActive }) =>
          linkBase +
          (isActive
            ? " bg-primary-600 text-white shadow-sm"
            : " text-gray-700 hover:bg-gray-100")
        }
      >
        <UsersIcon className="w-5 h-5" /> Usuarios
      </NavLink>
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-200 p-4 flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Administración</h2>
        {navLinks}
      </aside>
      <div className="flex-1 flex flex-col">
        {/* Top bar mobile */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-30">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
          >
            {open ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
          <h2 className="text-base font-semibold tracking-tight flex-1 truncate">
            {currentTitle}
          </h2>
        </div>
        {/* Dropdown panel mobile */}
        {open && (
          <div className="md:hidden px-4 py-3 border-b border-gray-200 bg-white shadow-sm animate-fade-in">
            {navLinks}
          </div>
        )}
        <main className="flex-1 w-full p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
