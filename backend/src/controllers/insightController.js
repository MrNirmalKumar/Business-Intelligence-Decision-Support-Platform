const mongoose = require('mongoose');
const Insight = require('../models/Insight');
const HealthScore = require('../models/HealthScore');
const Dataset = require('../models/Dataset');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getInsights = asyncHandler(async (req, res) => {
    const { datasetId, category, severity } = req.query;

    if (!datasetId) {
        throw new ApiError(400, 'datasetId query parameter is required');
    }

    // Verify ownership
    const dataset = await Dataset.findOne({ _id: datasetId, user_id: req.user._id });
    if (!dataset) {
        throw new ApiError(404, 'Dataset not found or unauthorized');
    }

    const query = { dataset_id: datasetId };

    if (category && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (severity && severity !== 'all') {
        query.severity = severity.toLowerCase();
    }

    const insights = await Insight.find(query).sort({
        severity: -1,
        created_at: -1
    });

    res.status(200).json(new ApiResponse(200, insights, 'Insights retrieved successfully'));
});

const getInsightById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const insight = await Insight.findById(id);
    if (!insight) {
        throw new ApiError(404, 'Insight not found');
    }

    // Verify dataset belongs to user
    const dataset = await Dataset.findOne({ _id: insight.dataset_id, user_id: req.user._id });
    if (!dataset) {
        throw new ApiError(403, 'Unauthorized access to this insight');
    }

    res.status(200).json(new ApiResponse(200, insight, 'Insight detail retrieved successfully'));
});

const getHealthScore = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({ _id: datasetId, user_id: req.user._id });
    if (!dataset) {
        throw new ApiError(404, 'Dataset not found or unauthorized');
    }

    const healthScore = await HealthScore.findOne({ dataset_id: datasetId });
    if (!healthScore) {
        throw new ApiError(404, 'Health score not found for this dataset');
    }

    res.status(200).json(new ApiResponse(200, healthScore, 'Health score retrieved successfully'));
});

module.exports = {
    getInsights,
    getInsightById,
    getHealthScore
};
