import axios from "axios";
import { BACKEND_URL } from "../utils/constants";

export const getReviewsByProduct = (productId) => {
  return axios.get(`${BACKEND_URL}/api/reviews/${productId}`);
};

export const addReview = (productId, reviewData) => {
  return axios.post(`${BACKEND_URL}/api/reviews/${productId}`, reviewData);
};
