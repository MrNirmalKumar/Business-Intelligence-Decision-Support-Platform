const mongoose = require('mongoose');
const Dataset = require('../models/Dataset');
const DatasetRecord = require('../models/DatasetRecord');
const HealthScore = require('../models/HealthScore');
const Insight = require('../models/Insight');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { calculateHealthScore, generateDynamicDaxInsights } = require('../utils/daxAnalytics');

// Verify dataset belongs to user
const verifyDatasetOwner = async (datasetId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(datasetId)) {
        throw new ApiError(400, 'Invalid dataset ID format');
    }
    const dataset = await Dataset.findOne({ _id: datasetId, user_id: userId });
    if (!dataset) {
        throw new ApiError(404, 'Dataset not found or unauthorized');
    }
    return dataset;
};

// 1. OVERALL EXECUTIVE SUMMARY & KPIs
const getSummary = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);
    const dataset = await Dataset.findById(dsObjectId).select('row_count uploaded_at file_name');

    const aggregation = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: null,
                total_sales: { $sum: '$sales' },
                total_profit: { $sum: '$profit' },
                total_quantity: { $sum: '$quantity' },
                unique_orders: { $addToSet: '$order_id' },
                unique_customers: { $addToSet: '$customer_id' }
            }
        },
        {
            $project: {
                _id: 0,
                total_sales: { $round: ['$total_sales', 2] },
                total_profit: { $round: ['$total_profit', 2] },
                total_quantity: 1,
                total_orders: { $size: '$unique_orders' },
                total_customers: { $size: '$unique_customers' }
            }
        }
    ]);

    const stats = aggregation[0] || {
        total_sales: 0,
        total_profit: 0,
        total_quantity: 0,
        total_orders: 0,
        total_customers: 0
    };

    const profit_margin = stats.total_sales > 0
        ? Math.round((stats.total_profit / stats.total_sales) * 10000) / 100
        : 0;

    const avg_order_value = stats.total_orders > 0
        ? Math.round((stats.total_sales / stats.total_orders) * 100) / 100
        : 0;

    // Fetch Health Score or calculate with exact DAX logic
    let healthScoreDoc = await HealthScore.findOne({ dataset_id: datasetId });
    if (!healthScoreDoc && stats.total_sales > 0) {
        const { score, category } = calculateHealthScore(stats.total_profit / stats.total_sales);
        healthScoreDoc = { score, score_category: category };
    }

    // Fetch primary executive insight
    const execInsight = await Insight.findOne({
        dataset_id: datasetId,
        category: 'Executive Overview'
    });

    res.status(200).json(new ApiResponse(200, {
        total_sales: stats.total_sales,
        total_profit: stats.total_profit,
        total_orders: stats.total_orders,
        total_customers: stats.total_customers,
        total_quantity: stats.total_quantity,
        profit_margin,
        avg_order_value,
        health_score: healthScoreDoc ? healthScoreDoc.score : null,
        health_category: healthScoreDoc ? healthScoreDoc.score_category : null,
        health_breakdown: healthScoreDoc ? healthScoreDoc.breakdown : null,
        dax_narrative: execInsight ? execInsight.description : null,
        lineage: dataset ? {
            file_name: dataset.file_name,
            row_count: dataset.row_count,
            uploaded_at: dataset.uploaded_at
        } : null
    }, 'Dashboard summary retrieved successfully'));
});

// 2. MONTHLY SALES TREND (Page 1 Executive Overview)
const getSalesTrend = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const trend = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$order_date' } },
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                month: '$_id',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] },
                orders: 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, trend, 'Sales trend retrieved successfully'));
});

// 3. MONTHLY PROFIT TREND
const getProfitTrend = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const trend = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$order_date' } },
                profit: { $sum: '$profit' },
                sales: { $sum: '$sales' }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                month: '$_id',
                profit: { $round: ['$profit', 2] },
                sales: { $round: ['$sales', 2] },
                margin: {
                    $cond: [
                        { $eq: ['$sales', 0] },
                        0,
                        { $round: [{ $multiply: [{ $divide: ['$profit', '$sales'] }, 100] }, 1] }
                    ]
                }
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, trend, 'Profit trend retrieved successfully'));
});

// 4. SALES & PROFIT BY CATEGORY (Page 1 Executive Overview)
const getCategoryPerformance = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const categories = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: '$category',
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' },
                quantity: { $sum: '$quantity' }
            }
        },
        { $sort: { sales: -1 } },
        {
            $project: {
                _id: 0,
                category: '$_id',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] },
                quantity: 1,
                margin: {
                    $cond: [
                        { $eq: ['$sales', 0] },
                        0,
                        { $round: [{ $multiply: [{ $divide: ['$profit', '$sales'] }, 100] }, 1] }
                    ]
                }
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, categories, 'Category performance retrieved successfully'));
});

// 5. SALES & PROFIT BY SUB-CATEGORY (Page 2 Sales & Profit Analysis)
const getSubCategoryPerformance = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const subCategories = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: '$sub_category',
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' },
                quantity: { $sum: '$quantity' },
                avg_discount: { $avg: '$discount' }
            }
        },
        { $sort: { sales: -1 } },
        {
            $project: {
                _id: 0,
                sub_category: '$_id',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] },
                quantity: 1,
                avg_discount: { $round: [{ $multiply: ['$avg_discount', 100] }, 1] },
                is_loss: { $lt: ['$profit', 0] },
                margin: {
                    $cond: [
                        { $eq: ['$sales', 0] },
                        0,
                        { $round: [{ $multiply: [{ $divide: ['$profit', '$sales'] }, 100] }, 1] }
                    ]
                }
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, subCategories, 'Sub-category performance retrieved successfully'));
});

// 6. YEAR-WISE SALES & PROFIT (Page 2 Sales & Profit Analysis - Combo Chart)
const getYearWisePerformance = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const yearData = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: { $year: '$order_date' },
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' },
                quantity: { $sum: '$quantity' }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                year: '$_id',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] },
                quantity: 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, yearData, 'Year-wise performance retrieved successfully'));
});

// 7. DISCOUNT VS PROFIT ANALYSIS (Page 2 Sales & Profit Analysis - Scatter/Scatter Plot)
const getDiscountVsProfit = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const scatter = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: '$sub_category',
                avg_discount: { $avg: '$discount' },
                profit: { $sum: '$profit' },
                sales: { $sum: '$sales' }
            }
        },
        { $sort: { avg_discount: 1 } },
        {
            $project: {
                _id: 0,
                sub_category: '$_id',
                avg_discount: { $round: [{ $multiply: ['$avg_discount', 100] }, 2] },
                profit: { $round: ['$profit', 2] },
                sales: { $round: ['$sales', 2] }
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, scatter, 'Discount vs Profit retrieved successfully'));
});

// 8. REGION-WISE SALES & PROFIT (Page 3 Customer & Regional Analysis)
const getRegionPerformance = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const regions = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: '$region',
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' },
                quantity: { $sum: '$quantity' }
            }
        },
        { $sort: { sales: -1 } },
        {
            $project: {
                _id: 0,
                region: '$_id',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] },
                quantity: 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, regions, 'Region performance retrieved successfully'));
});

// 9. MARKET-WISE SALES & PROFIT (Page 3 Customer & Regional Analysis)
const getMarketPerformance = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const markets = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: '$market',
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' },
                quantity: { $sum: '$quantity' }
            }
        },
        { $sort: { sales: -1 } },
        {
            $project: {
                _id: 0,
                market: '$_id',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] },
                quantity: 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, markets, 'Market performance retrieved successfully'));
});

// 10. SEGMENT-WISE SALES & PROFIT (Page 3 Customer & Regional Analysis - Donut Chart)
const getSegmentPerformance = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const segments = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: '$segment',
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' },
                quantity: { $sum: '$quantity' }
            }
        },
        { $sort: { sales: -1 } },
        {
            $project: {
                _id: 0,
                segment: '$_id',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] },
                quantity: 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, segments, 'Segment performance retrieved successfully'));
});

// 11. TOP 10 CUSTOMERS BY SALES (Page 3 Customer & Regional Analysis)
const getTopCustomers = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const customers = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: { customer_id: '$customer_id', customer_name: '$customer_name' },
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' }
            }
        },
        { $sort: { sales: -1 } },
        { $limit: 10 },
        {
            $project: {
                _id: 0,
                customer_id: '$_id.customer_id',
                customer_name: '$_id.customer_name',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] }
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, customers, 'Top 10 Customers retrieved successfully'));
});

// 12. TOP 10 PRODUCTS BY SALES (Page 4 Product & Shipping Analysis)
const getTopProducts = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const products = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: { product_id: '$product_id', product_name: '$product_name' },
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' }
            }
        },
        { $sort: { sales: -1 } },
        { $limit: 10 },
        {
            $project: {
                _id: 0,
                product_id: '$_id.product_id',
                product_name: '$_id.product_name',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] }
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, products, 'Top 10 Products retrieved successfully'));
});

// 13. ORDERS BY ORDER PRIORITY (Page 4 Product & Shipping Analysis - Donut Chart)
const getOrderPriority = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const priority = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: '$order_priority',
                unique_orders: { $addToSet: '$order_id' },
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' }
            }
        },
        {
            $project: {
                _id: 0,
                order_priority: '$_id',
                total_orders: { $size: '$unique_orders' },
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] }
            }
        },
        { $sort: { total_orders: -1 } }
    ]);

    res.status(200).json(new ApiResponse(200, priority, 'Order Priority retrieved successfully'));
});

// 14. SHIPPING MODE PERFORMANCE & SHIPPING COST (Page 4 Product & Shipping Analysis)
const getShippingAnalysis = asyncHandler(async (req, res) => {
    const { datasetId } = req.params;
    await verifyDatasetOwner(datasetId, req.user._id);

    const dsObjectId = new mongoose.Types.ObjectId(datasetId);

    const shipping = await DatasetRecord.aggregate([
        { $match: { dataset_id: dsObjectId } },
        {
            $group: {
                _id: '$ship_mode',
                sales: { $sum: '$sales' },
                profit: { $sum: '$profit' },
                total_shipping_cost: { $sum: '$shipping_cost' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { sales: -1 } },
        {
            $project: {
                _id: 0,
                ship_mode: '$_id',
                sales: { $round: ['$sales', 2] },
                profit: { $round: ['$profit', 2] },
                total_shipping_cost: { $round: ['$total_shipping_cost', 2] },
                orders: 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, shipping, 'Shipping analysis retrieved successfully'));
});

module.exports = {
    getSummary,
    getSalesTrend,
    getProfitTrend,
    getCategoryPerformance,
    getSubCategoryPerformance,
    getYearWisePerformance,
    getDiscountVsProfit,
    getRegionPerformance,
    getMarketPerformance,
    getSegmentPerformance,
    getTopCustomers,
    getTopProducts,
    getOrderPriority,
    getShippingAnalysis
};
