import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Public routes that should never send an auth token
const PUBLIC_ENDPOINTS = ["login/", "signup/", "token/refresh/"];

// Attach token automatically — but skip public endpoints
API.interceptors.request.use((config) => {
  const isPublic = PUBLIC_ENDPOINTS.some((endpoint) =>
    config.url?.includes(endpoint)
  );

  if (!isPublic) {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;