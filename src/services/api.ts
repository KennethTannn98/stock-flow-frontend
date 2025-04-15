
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

export type ProductCreate = Omit<Product, 'id'>;
export type ProductUpdate = Partial<Product>;
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
