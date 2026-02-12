import api from "./api";

export const getApprovedProducts = () => api.get("/products/status/APPROVED");

export const getProductById = (id) => api.get(`/products/${id}`);

export const getProductsByUser = (userId) =>
  api.get(`/users/${userId}/products`)



export const createProduct = (data) => api.post("/products", data);



export const getPendingProducts = () =>
  api.get("/products/status/PENDING")

export const approveProduct = (productId) =>
  api.put(`/products/${productId}/status/APPROVED`)

export const rejectProduct = (productId) =>
  api.put(`/products/${productId}/status/REJECTED`)


export const updateProduct = (productId, data) =>
  api.put(`/products/${productId}`, data)