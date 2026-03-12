import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/`
    : "http://127.0.0.1:8000/api/",
});

const PUBLIC_ENDPOINTS = ["login/", "signup/", "token/refresh/"];

// ✅ Check both storages
const getToken = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

const clearTokens = () => {
  ["access", "refresh"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

let logoutCallback = null;
export const attachLogout = (fn) => { logoutCallback = fn; };

API.interceptors.request.use((config) => {
  const isPublic = PUBLIC_ENDPOINTS.some((ep) => config.url?.includes(ep));
  if (!isPublic) {
    const token = getToken("access"); // ✅ was only reading localStorage
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("token/refresh/")
    ) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return API(original);
          })
          .catch(Promise.reject.bind(Promise));
      }

      isRefreshing = true;
      const refreshToken = getToken("refresh"); // ✅ was only reading localStorage

      if (!refreshToken) {
        clearTokens();
        if (logoutCallback) logoutCallback(); // ✅ sync React state
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await API.post("token/refresh/", { refresh: refreshToken });
        const storage = localStorage.getItem("access") ? localStorage : sessionStorage;
        storage.setItem("access", data.access);
        if (data.refresh) storage.setItem("refresh", data.refresh);
        processQueue(null, data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return API(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (logoutCallback) logoutCallback(); // ✅ sync React state
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export default API;
