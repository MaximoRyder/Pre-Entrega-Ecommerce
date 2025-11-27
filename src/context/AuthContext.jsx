import { createContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const login = (email, password) => {
    // Simulación simple: cualquier email/password válidos crean sesión.
    const isAdmin = email === "admin@admin.com" && password === "1234";
    const u = { email, role: isAdmin ? "admin" : "user" };
    localStorage.setItem("authUser", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("authUser");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthContext;
