import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/validators";
import FormField from "./FormField";

const Profile = () => {
  const { user, updateProfile, changePassword } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [errors, setErrors] = useState({});

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdErrors, setPwdErrors] = useState({});

  const validateProfile = () => {
    const newErrors = {};
    const n = validateName(name, 5, 100);
    if (n) newErrors.name = n;
    const e = validateEmail(email, 5, 100);
    if (e) newErrors.email = e;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    if (!validateProfile()) return;
    try {
      const updated = await updateProfile({ name, email });
      if (updated) {
        showToast("Perfil actualizado", 1400, "success");
      } else {
        showToast("No se pudo actualizar el perfil", 1600, "error");
      }
    } catch (e) {
      showToast(e.message || "Error actualizando perfil", 1800, "error");
    }
  };

  const validatePasswords = () => {
    const pErr = {};
    const curErr = validatePassword(currentPassword, 4, 20);
    if (curErr) pErr.currentPassword = curErr;
    const newErr = validatePassword(newPassword, 4, 20);
    if (newErr) pErr.newPassword = newErr;
    if (newPassword !== confirmPassword)
      pErr.confirmPassword = "Las contraseñas no coinciden";
    setPwdErrors(pErr);
    return Object.keys(pErr).length === 0;
  };

  const handleChangePassword = async (ev) => {
    ev.preventDefault();
    if (!validatePasswords()) return;
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res && res.ok) {
        showToast("Contraseña actualizada", 1400, "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPwdErrors({});
      } else {
        showToast(
          res?.message || "No se pudo cambiar la contraseña",
          1800,
          "error"
        );
      }
    } catch (e) {
      showToast(e.message || "Error cambiando contraseña", 1800, "error");
    }
  };

  return (
    <main className="w-full max-w-lg mx-auto py-10 sm:py-12">
      <section className="bg-surface/90 backdrop-blur rounded-lg border border-border shadow-sm px-6 py-7 mb-6">
        <h2 className="text-xl font-semibold text-main mb-3">Editar perfil</h2>
        <form
          onSubmit={handleUpdate}
          noValidate
          className="flex flex-col gap-4"
        >
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
              className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.email ? "border-red-500" : "border-border"
              }`}
            />
          </FormField>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </section>

      <section className="bg-surface/90 backdrop-blur rounded-lg border border-border shadow-sm px-6 py-7">
        <h2 className="text-xl font-semibold text-main mb-3">
          Cambiar contraseña
        </h2>
        <form
          onSubmit={handleChangePassword}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField
            label="Contraseña actual"
            htmlFor="currentPassword"
            error={pwdErrors.currentPassword}
          >
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (pwdErrors.currentPassword)
                  setPwdErrors({ ...pwdErrors, currentPassword: null });
              }}
              placeholder="••••••••"
              className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                pwdErrors.currentPassword ? "border-red-500" : "border-border"
              }`}
            />
          </FormField>

          <FormField
            label="Nueva contraseña"
            htmlFor="newPassword"
            error={pwdErrors.newPassword}
          >
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (pwdErrors.newPassword)
                  setPwdErrors({ ...pwdErrors, newPassword: null });
              }}
              placeholder="••••••••"
              className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                pwdErrors.newPassword ? "border-red-500" : "border-border"
              }`}
            />
          </FormField>

          <FormField
            label="Confirmar nueva contraseña"
            htmlFor="confirmPassword"
            error={pwdErrors.confirmPassword}
          >
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (pwdErrors.confirmPassword)
                  setPwdErrors({ ...pwdErrors, confirmPassword: null });
              }}
              placeholder="••••••••"
              className={`rounded-md border bg-surface px-3 py-2 text-sm text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                pwdErrors.confirmPassword ? "border-red-500" : "border-border"
              }`}
            />
          </FormField>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Cambiar contraseña
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Profile;
