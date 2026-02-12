import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
// User API
export const userAPI = {
  getAllLender: () =>API.get('/users/allLenders'),
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`),
  getByEmail: (email) => API.get(`/users/email/${email}`),
  getByStatus: (status) => API.get(`/users/status/${status}`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  assignRoles: (userId, roleIds) => API.post('/user-roles', { userId, roleIds }),
};

// Loan API
export const loanAPI = {

    // Razorpay endpoints
  createRazorpayOrder: (loanId, amount) => 
    axios.post('/api/payments/create-order', { loanId, amount }),
  
  verifyRazorpayPayment: (paymentData) => 
    axios.post('/api/payments/verify', paymentData),

  // Get all loans (admin)
  getAll: () => API.get('/loans/admin/all'),
  
  // Get loans by user
  getByUser: (userId) => API.get(`/loans/${userId}`),
  
  // Get loans where user is lender
  getMyLends: (lenderId) => API.get(`/loans/myLend/${lenderId}`),
  
  // Get loans where user is borrower
  getMyBorrows: (borrowerId) => API.get(`/loans/myBorrow/${borrowerId}`),
  
  // Request a new loan
  request: (borrowerId, lenderId, amount, tenure) => 
    API.post(`/loans/request?borrowerId=${borrowerId}&lenderId=${lenderId}&amount=${amount}&tenure=${tenure}`),
  
  // Accept a loan (lender action)
  accept: (loanId) => API.post(`/loans/accept/${loanId}`),
  
  // Reject a loan (lender action)
  reject: (loanId) => API.post(`/loans/reject/${loanId}`),
  
  // Repay a loan (borrower action)
  repay: (loanId, borrowerId, amount) => 
    API.post(`/loans/repay?loanId=${loanId}&borrowerId=${borrowerId}&amount=${amount}`),
};

// Product API
export const productAPI = {
  getAll: () => API.get('/products'),
  getById: (id) => API.get(`/products/${id}`),
  getByStatus: (status) => API.get(`/products/status/${status}`),
  getByCategory: (categoryId) => API.get(`/products/category/${categoryId}`),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  updateStatus: (id, status) => API.put(`/products/${id}/status/${status}`),
};

export default API;