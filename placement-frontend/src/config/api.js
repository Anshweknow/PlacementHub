const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export const getApiUrl = (path = "") => {
  if (!path) return API_BASE_URL || "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const getAuthToken = () => localStorage.getItem("token") || "";

export const authHeaders = (extraHeaders = {}) => ({
  ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
  ...extraHeaders,
});

export const storeSession = ({ token, role, fullName, user }) => {
  if (token) localStorage.setItem("token", token);
  if (role) localStorage.setItem("role", role);
  if (fullName) localStorage.setItem("fullName", fullName);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  ["token", "role", "fullName", "user"].forEach((key) => localStorage.removeItem(key));
};
