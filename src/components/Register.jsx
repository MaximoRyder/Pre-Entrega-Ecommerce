import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import { UserPlusIcon } from "@heroicons/react/24/outline";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { register, login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password || !name) {
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
      const created = await register({ email, password, name });
      if (created) {
        showToast("Registrado correctamente", 1400, "success");
        // try auto-login
        const u = await login(email, password);
        if (u) {
          const to = u?.role === "admin" ? "/admin" : "/";
          setTimeout(() => navigate(to), 700);
        } else {
          setTimeout(() => navigate("/login"), 700);
        }
      } else {
        showToast("Error al registrarse", 1800, "error");
      }
    } catch (err) {
      showToast("Error al registrarse", 1800, "error");
    }
  };

  return (
    <main className="w-full max-w-md mx-auto py-10 sm:py-12">
      <form
        onSubmit={handleSubmit}
        aria-label="form-register"
        className="bg-white/90 backdrop-blur rounded-lg border border-neutral-200 shadow-sm px-6 py-7 flex flex-col gap-5"
      >
        <h2 className="text-xl font-semibold text-neutral-800">Crear cuenta</h2>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="name"
            className="text-xs font-medium text-neutral-600 uppercase tracking-wide"
          >
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="text-xs font-medium text-neutral-600 uppercase tracking-wide"
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
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-xs font-medium text-neutral-600 uppercase tracking-wide"
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
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          />
        </div>

        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <UserPlusIcon className="w-5 h-5" />
          Registrarse
        </button>
        <p className="text-center text-xs text-neutral-600">
          ¿Ya tenés cuenta?{" "}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Iniciar sesión
          </Link>
        </p>
      </form>
    </main>
  );
};

export default Register;
