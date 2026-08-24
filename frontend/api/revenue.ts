import apiClient from './apiClient';

export interface RevenueFilters {
  range?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  status?: string;
  orderType?: string;
  page?: number;
  limit?: number;
}

export const getRevenueDashboard = async (filters: RevenueFilters = {}) => {
  const response = await apiClient.get('/revenue/overview', { params: filters });
  return response.data;
};

export const getRevenuePaymentBreakdown = async (filters: RevenueFilters = {}) => {
  const response = await apiClient.get('/revenue/payment-methods', { params: filters });
  return response.data;
};

export const getRevenueTaxSummary = async (filters: RevenueFilters = {}) => {
  const response = await apiClient.get('/revenue/tax-summary', { params: filters });
  return response.data;
};

export const getRevenueDailyData = async (filters: RevenueFilters = {}) => {
  const response = await apiClient.get('/revenue/daily', { params: filters });
  return response.data;
};

export const getBestPerformingDays = async (filters: RevenueFilters = {}) => {
  const response = await apiClient.get('/revenue/best-days', { params: filters });
  return response.data;
};

export const exportRevenuePdf = async (filters: RevenueFilters = {}) => {
  const response = await apiClient.get('/revenue/export/pdf', {
    params: filters,
    responseType: 'blob',
  });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'restaurant-revenue-report.pdf';
  link.click();
  window.URL.revokeObjectURL(blobUrl);
};

export const exportRevenueExcel = async (filters: RevenueFilters = {}) => {
  const response = await apiClient.get('/revenue/export/xlsx', {
    params: filters,
    responseType: 'blob',
  });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'restaurant-revenue-report.xlsx';
  link.click();
  window.URL.revokeObjectURL(blobUrl);
};
