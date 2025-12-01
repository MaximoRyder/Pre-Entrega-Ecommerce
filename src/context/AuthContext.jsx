import { createContext, useCallback, useState } from "react";

const AuthContext = createContext();

const USERS_API =
  import.meta.env.VITE_USERS_API ||
  "https://6928f88e9d311cddf347cd7f.mockapi.io/api/v1/users";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) return parsed;
    } catch (e) {
      console.error("Error recuperando la sesión:", e);
    }

    try {
      localStorage.removeItem("authUser");
    } catch (e) {
      console.error("Error limpiando la sesión:", e);
    }
    return null;
  });

  const login = useCallback(async (email, password) => {
    if (!email || !password) return null;
    try {
      const url = `${USERS_API}?email=${encodeURIComponent(
        email
      )}&password=${encodeURIComponent(password)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const list = await res.json();
      if (!Array.isArray(list) || list.length === 0) return null;
      const u = list[0];
      const saved = {
        id: u.id,
        email: u.email,
        role: u.role || "user",
        name: u.name,
      };
      localStorage.setItem("authUser", JSON.stringify(saved));
      setUser(saved);
      return saved;
    } catch (e) {
      console.error("Error de inicio de sesión:", e);
      throw e;
    }
  }, []);

  const register = useCallback(
    async ({ email, password, role = "user", name = "" }) => {
      try {
        const res = await fetch(USERS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            role,
            name,
            createdAt: new Date().toISOString(),
          }),
        });
        if (!res.ok) throw new Error(`Error al registrar: ${res.status}`);
        const created = await res.json();
        return created;
      } catch (e) {
        console.error("Error de registro:", e);
        throw e;
      }
    },
    []
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("authUser");
    } catch (e) {
      console.error("Error limpiando la sesión:", e);
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data = {}) => {
      if (!user || !user.id) throw new Error("Usuario no autenticado");
      try {
        const url = `${USERS_API}/${user.id}`;
        const getRes = await fetch(url);
        if (!getRes.ok)
          throw new Error(`Error leyendo usuario: ${getRes.status}`);
        const current = await getRes.json();
        const payload = { ...current, ...data };
        const putRes = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!putRes.ok)
          throw new Error(`Error actualizando perfil: ${putRes.status}`);
        const updated = await putRes.json();
        const saved = {
          id: updated.id,
          email: updated.email,
          role: updated.role || user.role || "user",
          name: updated.name,
        };
        try {
          localStorage.setItem("authUser", JSON.stringify(saved));
        } catch (e) {
          console.error("Error guardando sesión local:", e);
        }
        setUser(saved);
        return saved;
      } catch (e) {
        console.error("Error actualizando perfil:", e);
        throw e;
      }
    },
    [user]
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!user || !user.id) throw new Error("Usuario no autenticado");
      try {
        const url = `${USERS_API}/${user.id}`;
        const res = await fetch(url);
        if (!res.ok)
          throw new Error(`Error consultando usuario: ${res.status}`);
        const record = await res.json();
        if (!record || record.password !== currentPassword) {
          return { ok: false, message: "Contraseña actual incorrecta" };
        }
        const payload = { ...record, password: newPassword };
        const put = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!put.ok)
          throw new Error(`Error actualizando contraseña: ${put.status}`);
        return { ok: true };
      } catch (e) {
        console.error("Error cambiando contraseña:", e);
        throw e;
      }
    },
    [user]
  );

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContext;
