import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getMe, refreshToken } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data);
      } catch (err) {
        const refresh = localStorage.getItem("refresh_token");
        if (refresh) {
          try {
            const refreshRes = await refreshToken(refresh);
            localStorage.setItem("access_token", refreshRes.data.access);
            const userRes = await getMe();
            setUser(userRes.data);
          } catch (refreshErr) {
            logout();
          }
        } else {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    const userRes = await getMe();
    setUser(userRes.data);
    return userRes.data;
  };

  const register = async (name, email, password) => {
    await registerUser({ name, email, password });
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
