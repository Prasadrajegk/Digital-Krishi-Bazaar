import api from "./api"

export const addToCart = (productId, userId) =>
  api.post(`/cart/add/product/${productId}?userId=${userId}`)

export const removeFromCart = (productId, userId) =>
  api.delete(`/cart/remove/product/${productId}?userId=${userId}`)


export const getCartByUser = (userId) =>
  api.get(`/cart/user/${userId}`)

export const incrementCartItem = (productId, userId) =>
  api.post(`/cart/add/product/${productId}?userId=${userId}`)

export const decrementCartItem = (productId, userId) =>
  api.post(`/cart/decrement/product/${productId}?userId=${userId}`)

export const removeCartItem = (productId, userId) =>
  api.delete(`/cart/remove/product/${productId}?userId=${userId}`)






