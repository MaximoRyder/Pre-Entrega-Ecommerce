import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/validators";
import FormField from "./FormField";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const { register, login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const nameError = validateName(name, 5, 100);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(email, 5, 100);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password, 4, 20);
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const created = await register({ email, password, name });
      if (created) {
        showToast("Registrado correctamente", 1400, "success");
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
    } catch {
      showToast("Error al registrarse", 1800, "error");
    }
  };

  return (
    <main className="w-full max-w-md mx-auto py-10 sm:py-12">
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="form-register"
        className="bg-surface/90 backdrop-blur rounded-lg border border-border shadow-sm px-6 py-7 flex flex-col gap-5"
      >
        <h2 className="text-xl font-semibold text-main">Crear cuenta</h2>

        <FormField label="Nombre" htmlFor="name" error={errors.name}>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: null });
            }}
            placeholder="Tu nombre"
            required
            className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.name ? "border-red-500" : "border-border"
            }`}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            placeholder="tu@ejemplo.com"
            required
            className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.email ? "border-red-500" : "border-border"
            }`}
          />
        </FormField>

        <FormField
          label="Contraseña"
          htmlFor="password"
          error={errors.password}
        >
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            placeholder="••••••••"
            required
            className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.password ? "border-red-500" : "border-border"
            }`}
          />
        </FormField>

        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <UserPlusIcon className="w-5 h-5" />
          Registrarse
        </button>
        <p className="text-center text-xs text-sub">
          ¿Ya tenés cuenta?{" "}
          <Link
            to="/login"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Iniciar sesión
          </Link>
        </p>
      </form>
    </main>
  );
};

export default Register;
