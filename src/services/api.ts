
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with base configuration
const instance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for CORS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add JWT token to every request if available
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Types for API responses
export interface DashboardStats {
  totalProducts: number;
  totalAlertsYTD: number;
  totalLowStockProducts: number;
  totalOutOfStockProducts: number;
}

export interface MonthlyTransaction {
  month: string;
  inSum: number;
  outSum: number;
}

export interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  sku: string;
  category: string;
  reorder: number;
}

export interface Transaction {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantity: number;
  transactionType: 'IN' | 'OUT' | 'ADJUSTMENT';
  reference: string;
  transactionDate: string;
  createdBy: string;
}

export interface Alert {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  resolved: boolean;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  updatedBy: string;
}

// User management types
export interface User {
  id: number;
  username: string;
  password: null;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER';
  createdDate: string | null;
  updatedDate: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export type UserCreate = {
  username: string;
  password: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER';
};

export type ProductCreate = Omit<Product, 'id'>;
export type ProductUpdate = Partial<Product>;
export type TransactionCreate = Omit<Transaction, 'id'>;
export type TransactionUpdate = Partial<Transaction>;
export type AlertCreate = Omit<Alert, 'id' | 'createdDate' | 'updatedDate'>;
export type AlertUpdate = Partial<Omit<Alert, 'id' | 'createdDate' | 'updatedDate'>>;
export type LowStockProduct = Product;

// API service methods
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await instance.get(`/dashboard/stats`);
  return response.data;
};

export const getMonthlyTransactions = async (): Promise<MonthlyTransaction[]> => {
  const response = await instance.get(`/dashboard/monthly-transactions`);
  return response.data;
};

export const getLowStockProducts = async (): Promise<LowStockProduct[]> => {
  const response = await instance.get(`/dashboard/low-stocks`);
  return response.data;
};

// New API method to fetch today's transactions
export const getTodaysTransactions = async (): Promise<Transaction[]> => {
  const response = await instance.get(`/dashboard/todays-transactions`);
  return response.data;
};

// Auth API methods
export interface LoginResponse {
  token: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await instance.post('/auth/login', { username, password });
  return response.data;
};

// Product API methods
export const getProducts = async (): Promise<Product[]> => {
  const response = await instance.get(`/products`);
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await instance.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: ProductCreate): Promise<Product> => {
  const response = await instance.post(`/products`, product);
  return response.data;
};

export const updateProduct = async (id: number, product: ProductUpdate): Promise<Product> => {
  const response = await instance.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await instance.delete(`/products/${id}`);
};

// Transaction API methods
export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await instance.get(`/transactions`);
  return response.data;
};

export const getProductTransactions = async (productId: number): Promise<Transaction[]> => {
  const response = await instance.get(`/transactions/product/${productId}`);
  return response.data;
};

export const getTransaction = async (id: number): Promise<Transaction> => {
  const response = await instance.get(`/transactions/${id}`);
  return response.data;
};

export const createTransaction = async (transaction: TransactionCreate): Promise<Transaction> => {
  const response = await instance.post(`/transactions`, transaction);
  return response.data;
};

export const updateTransaction = async (id: number, transaction: TransactionUpdate): Promise<Transaction> => {
  const response = await instance.put(`/transactions/${id}`, transaction);
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await instance.delete(`/transactions/${id}`);
};

// Alert API methods
export const getAlerts = async (): Promise<Alert[]> => {
  const response = await instance.get(`/alerts`);
  return response.data;
};

export const getAlert = async (id: number): Promise<Alert> => {
  const response = await instance.get(`/alerts/${id}`);
  return response.data;
};

export const createAlert = async (alert: AlertCreate): Promise<Alert> => {
  const response = await instance.post(`/alerts`, alert);
  return response.data;
};

export const updateAlert = async (id: number, alert: AlertUpdate): Promise<Alert> => {
  const response = await instance.put(`/alerts/${id}`, alert);
  return response.data;
};

export const deleteAlert = async (id: number): Promise<void> => {
  await instance.delete(`/alerts/${id}`);
};

// Admin User Management API methods
export const getUsers = async (): Promise<User[]> => {
  const response = await instance.get(`/admin/users`);
  return response.data;
};

export const createUser = async (user: UserCreate): Promise<User> => {
  const response = await instance.post(`/admin/users`, user);
  return response.data;
};

export const updateUserRole = async (username: string, role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER'): Promise<User> => {
  const response = await instance.put(`/admin/users/username/${username}/role`, { role });
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await instance.delete(`/admin/users/${id}`);
};
