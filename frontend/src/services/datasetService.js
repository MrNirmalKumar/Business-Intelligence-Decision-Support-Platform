import api from './api';

export const uploadDatasetFile = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/datasets/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });
    return response.data;
};

export const getDatasets = async () => {
    const response = await api.get('/datasets');
    return response.data;
};

export const getDatasetById = async (id) => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
};

export const getDatasetPreview = async (id, limit = 20) => {
    const response = await api.get(`/datasets/${id}/preview?limit=${limit}`);
    return response.data;
};

export const deleteDataset = async (id, action = 'trash') => {
    let query = '';
    if (action === 'permanent') query = '?permanent=true';
    if (action === 'restore') query = '?permanent=restore';
    const response = await api.delete(`/datasets/${id}${query}`);
    return response.data;
};
