
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

export interface LowStockProduct {
  id: number;
  name: string;
  quantity: number;
  price: number;
  sku: string;
  category: string;
  reorder: number;
}

// API service methods
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
  return response.data;
};

export const getMonthlyTransactions = async (): Promise<MonthlyTransaction[]> => {
  const response = await axios.get(`${API_BASE_URL}/monthly-transactions`);
  return response.data;
};

export const getLowStockProducts = async (): Promise<LowStockProduct[]> => {
  const response = await axios.get(`${API_BASE_URL}/low-stocks`);
  return response.data;
};
