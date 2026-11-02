const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');
const DatasetRecord = require('../models/DatasetRecord');
const HealthScore = require('../models/HealthScore');
const Insight = require('../models/Insight');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { processDatasetAnalytics } = require('../services/analyticsService');

const uploadDataset = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'Please upload a file (.csv, .xlsx, .xls)');
    }

    const { originalname, path: filePath } = req.file;
    const ext = path.extname(originalname).toLowerCase().replace('.', '');

    const dataset = await Dataset.create({
        user_id: req.user._id,
        file_name: originalname,
        file_type: ext,
        file_path: filePath,
        status: 'uploaded'
    });

    // Run processing synchronously so UI doesn't fetch incomplete data
    try {
        await processDatasetAnalytics(dataset._id);
    } catch (procErr) {
        console.error('Dataset processing error:', procErr.message);
        throw new ApiError(500, 'Error processing dataset: ' + procErr.message);
    }

    const updatedDataset = await Dataset.findById(dataset._id);

    res.status(201).json(new ApiResponse(201, {
        dataset: updatedDataset,
        summary: null
    }, 'Dataset uploaded and processed successfully.'));
});

const getDatasets = asyncHandler(async (req, res) => {
    const datasets = await Dataset.find({ user_id: req.user._id }).sort({ uploaded_at: -1 });

    res.status(200).json(new ApiResponse(200, datasets, 'Datasets retrieved successfully'));
});

const getDatasetById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dataset = await Dataset.findOne({ _id: id, user_id: req.user._id });

    if (!dataset) {
        throw new ApiError(404, 'Dataset not found');
    }

    const healthScore = await HealthScore.findOne({ dataset_id: id });
    const insightsCount = await Insight.countDocuments({ dataset_id: id });

    res.status(200).json(new ApiResponse(200, {
        dataset,
        healthScore,
        insightsCount
    }, 'Dataset details retrieved successfully'));
});

const getDatasetPreview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dataset = await Dataset.findOne({ _id: id, user_id: req.user._id });

    if (!dataset) {
        throw new ApiError(404, 'Dataset not found');
    }

    const limit = parseInt(req.query.limit, 10) || 20;
    const records = await DatasetRecord.find({ dataset_id: id }).limit(limit);

    res.status(200).json(new ApiResponse(200, {
        file_name: dataset.file_name,
        total_rows: dataset.row_count,
        preview_count: records.length,
        records
    }, 'Dataset preview retrieved successfully'));
});

const deleteDataset = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { permanent } = req.query;
    const dataset = await Dataset.findOne({ _id: id, user_id: req.user._id });

    if (!dataset) {
        throw new ApiError(404, 'Dataset not found');
    }

    if (permanent === 'true') {
        if (dataset.file_path && fs.existsSync(dataset.file_path)) {
            try {
                fs.unlinkSync(dataset.file_path);
            } catch (e) {
                console.error('File unlink error:', e);
            }
        }
        await DatasetRecord.deleteMany({ dataset_id: id });
        await Insight.deleteMany({ dataset_id: id });
        await HealthScore.deleteMany({ dataset_id: id });
        await Dataset.deleteOne({ _id: id });
        res.status(200).json(new ApiResponse(200, null, 'Dataset permanently deleted'));
    } else if (permanent === 'restore') {
        dataset.status = 'processed';
        await dataset.save();
        res.status(200).json(new ApiResponse(200, null, 'Dataset restored'));
    } else {
        dataset.status = 'trashed';
        await dataset.save();
        res.status(200).json(new ApiResponse(200, null, 'Dataset moved to trash'));
    }
});

module.exports = {
    uploadDataset,
    getDatasets,
    getDatasetById,
    getDatasetPreview,
    deleteDataset
};
