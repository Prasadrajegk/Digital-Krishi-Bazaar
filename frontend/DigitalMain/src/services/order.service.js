import api from "./api"

export const getAllOrders = () =>
  api.get("/orders")

export const placeOrder = (userId, paymentMode = "ONLINE") =>
  api.post(`/orders/place?userId=${userId}&paymentMode=${paymentMode}`)

export const cancelOrder = (orderId) =>
  api.put(`/orders/${orderId}/status/CANCELED`)

export const completeOrder = (orderId) =>
  api.put(`/orders/${orderId}/status/COMPLETED`)


export const getOrdersByUser = (userId) =>
  api.get(`/orders/user/${userId}`)



export const getOrdersBySeller = (sellerId) =>
  api.get(`/orders/seller/${sellerId}`)




