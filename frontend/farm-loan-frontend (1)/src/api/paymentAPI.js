import API from "./axios";

export const paymentAPI = {
  createOrder: (amount) =>
    API.post("/payments/create-order", null, {
      params: { amount },
    }),

  verifyPayment: (data) =>
    API.post("/payments/verify", data),
};
