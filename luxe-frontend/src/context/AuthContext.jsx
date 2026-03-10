import { createContext, useState, useEffect } from "react";
import { attachLogout } from "../services/api"; // ✅ add this

export const AuthContext = createContext();

const getStored = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = getStored("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    setUser(null);
  };

  // ✅ Give the API interceptor access to logout so a failed
  //    refresh can clear React state, not just localStorage
  useEffect(() => {
    attachLogout(logout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};