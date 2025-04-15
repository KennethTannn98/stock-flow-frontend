
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

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

export type ProductCreate = Omit<Product, 'id'>;
export type ProductUpdate = Partial<Product>;
export type TransactionCreate = Omit<Transaction, 'id'>;
export type TransactionUpdate = Partial<Transaction>;
export type AlertCreate = Omit<Alert, 'id' | 'createdDate' | 'updatedDate'>;
export type AlertUpdate = Partial<Omit<Alert, 'id' | 'createdDate' | 'updatedDate'>>;
export type LowStockProduct = Product;

// API service methods
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
  return response.data;
};

export const getMonthlyTransactions = async (): Promise<MonthlyTransaction[]> => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/monthly-transactions`);
  return response.data;
};

export const getLowStockProducts = async (): Promise<LowStockProduct[]> => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/low-stocks`);
  return response.data;
};

// Product API methods
export const getProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await axios.get(`${API_BASE_URL}/products/${id}`);
  return response.data;
};

export const createProduct = async (product: ProductCreate): Promise<Product> => {
  const response = await axios.post(`${API_BASE_URL}/products`, product);
  return response.data;
};

export const updateProduct = async (id: number, product: ProductUpdate): Promise<Product> => {
  const response = await axios.put(`${API_BASE_URL}/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/products/${id}`);
};

// Transaction API methods
export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await axios.get(`${API_BASE_URL}/transactions`);
  return response.data;
};

export const getTransaction = async (id: number): Promise<Transaction> => {
  const response = await axios.get(`${API_BASE_URL}/transactions/${id}`);
  return response.data;
};

export const createTransaction = async (transaction: TransactionCreate): Promise<Transaction> => {
  const response = await axios.post(`${API_BASE_URL}/transactions`, transaction);
  return response.data;
};

export const updateTransaction = async (id: number, transaction: TransactionUpdate): Promise<Transaction> => {
  const response = await axios.put(`${API_BASE_URL}/transactions/${id}`, transaction);
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/transactions/${id}`);
};

// Alert API methods
export const getAlerts = async (): Promise<Alert[]> => {
  const response = await axios.get(`${API_BASE_URL}/alerts`);
  return response.data;
};

export const getAlert = async (id: number): Promise<Alert> => {
  const response = await axios.get(`${API_BASE_URL}/alerts/${id}`);
  return response.data;
};

export const createAlert = async (alert: AlertCreate): Promise<Alert> => {
  const response = await axios.post(`${API_BASE_URL}/alerts`, alert);
  return response.data;
};

export const updateAlert = async (id: number, alert: AlertUpdate): Promise<Alert> => {
  const response = await axios.put(`${API_BASE_URL}/alerts/${id}`, alert);
  return response.data;
};

export const deleteAlert = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/alerts/${id}`);
};
