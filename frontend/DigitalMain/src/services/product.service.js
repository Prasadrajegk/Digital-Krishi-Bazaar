import api from "./api";

import axios from "axios";
import { BACKEND_URL } from "../utils/constants";



/* ======================
   BUYER APIs (REGION BASED)
   ====================== */

// ✅ Buyer sees only APPROVED products from SAME REGION
export const getApprovedProductsByRegion = (userId) =>
  api.get(`/products/region/user/${userId}`);


/* ======================
   COMMON PRODUCT APIs
   ====================== */

export const getProductById = (id) =>
  api.get(`/products/${id}`);


/* ======================
   SELLER APIs
   ====================== */

// Seller sees only HIS products
export const getProductsByUser = (userId) =>
  api.get(`/users/${userId}/products`);

export const getProductsByUserActive = (userId) =>
  api.get(`/products/seller/${userId}/active`);


export const createProduct = (data) =>
  api.post("/products", data);

export const updateProduct = (productId, data) =>
  api.put(`/products/${productId}`, data);




/* ======================
   ADMIN APIs
   ====================== */

// Admin sees all pending products
export const getPendingProducts = () =>
  api.get("/products/status/PENDING");

export const approveProduct = (productId) => 
  api.put(`/products/${productId}/status/APPROVED`);

export const rejectProduct = (productId) =>
  api.put(`/products/${productId}/status/REJECTED`);






export const getAllProducts = () => {
  return axios.get(`${BACKEND_URL}/api/products`);
};

export const getProductsByCategory = (categoryId) => {
  return axios.get(`${BACKEND_URL}/api/products/category/${categoryId}/status/APPROVED`);
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};
