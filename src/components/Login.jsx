import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useContext(ToastContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    if (!email || !password) {
      showToast("Por favor completa todos los campos", 1800, "info");
      return false;
    }
    if (!email.includes("@") || email.length < 5) {
      showToast("Ingresa un email válido", 1800, "info");
      return false;
    }
    if (password.length < 4) {
      showToast("La contraseña debe tener al menos 4 caracteres", 1800, "info");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const user = await login(email, password);
      if (user) {
        showToast(
          user?.role === "admin"
            ? "Bienvenido, administrador"
            : "Inicio de sesión exitoso",
          1400,
          "success"
        );
        const to =
          (location.state &&
            location.state.from &&
            location.state.from.pathname) ||
          (user?.role === "admin" ? "/admin" : "/");
        setTimeout(() => navigate(to), 700);
      } else {
        showToast("Credenciales inválidas", 1600, "error");
      }
    } catch (err) {
      showToast(err.message || "Error al iniciar sesión", 1800, "error");
    }
  };

  return (
    <main className="w-full max-w-md mx-auto py-10 sm:py-12">
      <form
        onSubmit={handleSubmit}
        aria-label="form-login"
        className="bg-surface/90 backdrop-blur rounded-lg border border-border shadow-sm px-6 py-7 flex flex-col gap-5"
      >
        <h2 className="text-xl font-semibold text-main">Iniciar sesión</h2>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="text-xs font-medium text-sub uppercase tracking-wide"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@ejemplo.com"
            required
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-xs font-medium text-sub uppercase tracking-wide"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Entrar
        </button>
        <p className="text-center text-xs text-sub">
          ¿No tenés cuenta?{" "}
          <Link
            to="/register"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Crear cuenta
          </Link>
        </p>
      </form>
    </main>
  );
};

export default Login;
