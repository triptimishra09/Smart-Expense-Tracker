import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getExpenses = () => API.get('/expenses');
export const addExpense = (data) => API.post('/expenses', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const getAnalytics = () => API.get('/expenses/analytics');
export const setOverallBudget = (data) => API.post('/budget/overall', data);
export const setCategoryBudget = (data) => API.post('/budget/category', data);
export const getBudgetStatus = () => API.get('/budget/status');