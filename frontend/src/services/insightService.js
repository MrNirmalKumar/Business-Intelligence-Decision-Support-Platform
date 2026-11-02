import api from './api';

export const getInsights = async (datasetId, category = 'all', severity = 'all') => {
    let url = `/insights?datasetId=${datasetId}`;
    if (category && category !== 'all') url += `&category=${category}`;
    if (severity && severity !== 'all') url += `&severity=${severity}`;

    const response = await api.get(url);
    return response.data;
};

export const getInsightById = async (id) => {
    const response = await api.get(`/insights/${id}`);
    return response.data;
};

export const getHealthScore = async (datasetId) => {
    const response = await api.get(`/insights/health-score/${datasetId}`);
    return response.data;
};
