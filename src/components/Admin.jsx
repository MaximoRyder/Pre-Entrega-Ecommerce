import {
  ClipboardDocumentListIcon,
  CubeIcon,
  TagIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";

const Admin = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-white p-4 flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Administración</h2>
        <nav className="flex flex-col gap-1">
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
      </aside>
      <main className="flex-1 px-6 py-6 max-w-screen-xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
