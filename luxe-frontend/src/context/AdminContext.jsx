import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

/**
 * ADMIN_API — separate axios instance for admin panel.
 *
 * Token priority:
 *  1. admin_access  — set when logging in via /admin/login
 *  2. access        — set when a staff user logs in via the normal /login page
 *                     and then navigates to the admin panel directly.
 *
 * This means staff users never need to "double login".
 */
export const ADMIN_API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

ADMIN_API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("admin_access") ||   // dedicated admin session
    localStorage.getItem("access");            // normal login fallback

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AdminProvider = ({ children }) => {
  const [admin,    setAdmin]    = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 1. Check dedicated admin session first
    const adminStored = localStorage.getItem("admin_user");
    if (adminStored) {
      setAdmin(JSON.parse(adminStored));
      setChecking(false);
      return;
    }

    // 2. Fall back to normal user session — but only if they are staff
    const userStored = localStorage.getItem("user");
    if (userStored) {
      const user = JSON.parse(userStored);
      if (user?.is_staff) {
        // Treat them as admin using the regular access token
        setAdmin(user);
      }
    }

    setChecking(false);
  }, []);

  /** Called after /admin/login — stores a dedicated admin session */
  const adminLogin = (userData, access, refresh) => {
    localStorage.setItem("admin_access",  access);
    localStorage.setItem("admin_refresh", refresh);
    localStorage.setItem("admin_user",    JSON.stringify(userData));
    setAdmin(userData);
  };

  const adminLogout = () => {
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    localStorage.removeItem("admin_user");
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, adminLogin, adminLogout, checking }}>
      {children}
    </AdminContext.Provider>
  );
};