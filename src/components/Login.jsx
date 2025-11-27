import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import "../styles/Login.css";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const user = login(email, password);
    showToast(
      user?.role === "admin"
        ? "Bienvenido, administrador"
        : "Inicio de sesión exitoso",
      1400,
      "success"
    );

    const to =
      (location.state && location.state.from && location.state.from.pathname) ||
      (user?.role === "admin" ? "/admin" : "/");
    setTimeout(() => navigate(to), 700);
  };

  return (
    <main className="login-page">
      <form
        className="login-form"
        onSubmit={handleSubmit}
        aria-label="form-login"
      >
        <h2>Iniciar sesión</h2>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@ejemplo.com"
            required
          />
        </label>

        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <div className="actions">
          <button className="btn" data-variant="primary" type="submit">
            Entrar
          </button>
        </div>
      </form>
    </main>
  );
};

export default Login;
