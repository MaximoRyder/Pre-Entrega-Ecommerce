import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import "../styles/Login.css";

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
    <main className="login-page">
      <form
        className="login-form"
        onSubmit={handleSubmit}
        aria-label="form-register"
      >
        <h2>Crear cuenta</h2>

        <label className="field">
          <span>Nombre</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </label>

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

        {/* Role is assigned by admins in MockAPI — public registration creates users */}

        <div className="actions">
          <button className="btn" data-variant="primary" type="submit">
            Registrarse
          </button>
        </div>
      </form>
    </main>
  );
};

export default Register;
