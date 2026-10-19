// Centralized backend base URL configuration
export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "https://mern-chatapp-xbbo.onrender.com"
).replace(/\/+$/, "");
