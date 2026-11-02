import api from './api';

export const getDashboardSummary = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/summary`);
    return response.data;
};

export const getSalesTrend = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/sales-trend`);
    return response.data;
};

export const getProfitTrend = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/profit-trend`);
    return response.data;
};

export const getCategoryPerformance = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/category-performance`);
    return response.data;
};

export const getSubCategoryPerformance = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/sub-category-performance`);
    return response.data;
};

export const getYearWisePerformance = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/year-wise-performance`);
    return response.data;
};

export const getDiscountVsProfit = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/discount-vs-profit`);
    return response.data;
};

export const getRegionPerformance = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/region-performance`);
    return response.data;
};

export const getMarketPerformance = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/market-performance`);
    return response.data;
};

export const getSegmentPerformance = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/segment-performance`);
    return response.data;
};

export const getTopCustomers = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/top-customers`);
    return response.data;
};

export const getTopProducts = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/top-products`);
    return response.data;
};

export const getOrderPriority = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/order-priority`);
    return response.data;
};

export const getShippingAnalysis = async (datasetId) => {
    const response = await api.get(`/dashboard/${datasetId}/shipping-analysis`);
    return response.data;
};
