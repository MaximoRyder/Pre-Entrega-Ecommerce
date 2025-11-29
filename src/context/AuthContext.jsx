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

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContext;
