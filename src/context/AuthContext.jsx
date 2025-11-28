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
      // malformed — remove
      try {
        localStorage.removeItem("authUser");
      } catch (e2) {}
      return null;
    } catch (e) {
      try {
        localStorage.removeItem("authUser");
      } catch (e2) {}
      return null;
    }
  });

  // Login against MockAPI users resource. Returns user object or null.
  const login = useCallback(async (email, password) => {
    // Basic client-side validation
    if (!email || !password) return null;
    try {
      const url = `${USERS_API}?email=${encodeURIComponent(
        email
      )}&password=${encodeURIComponent(password)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const list = await res.json();
      if (!Array.isArray(list) || list.length === 0) return null;
      const u = list[0];
      // persist minimal user object
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
      console.error("Login error:", e);
      return null;
    }
  }, []);

  // Optional register helper (creates user in MockAPI). Returns created user or null.
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
        if (!res.ok) throw new Error(`Register failed ${res.status}`);
        const created = await res.json();
        return created;
      } catch (e) {
        console.error("Register error:", e);
        return null;
      }
    },
    []
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("authUser");
    } catch (e) {}
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
