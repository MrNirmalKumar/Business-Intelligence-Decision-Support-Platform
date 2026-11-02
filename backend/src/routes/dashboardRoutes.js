const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:datasetId/summary', getSummary);
router.get('/:datasetId/sales-trend', getSalesTrend);
router.get('/:datasetId/profit-trend', getProfitTrend);
router.get('/:datasetId/category-performance', getCategoryPerformance);
router.get('/:datasetId/sub-category-performance', getSubCategoryPerformance);
router.get('/:datasetId/year-wise-performance', getYearWisePerformance);
router.get('/:datasetId/discount-vs-profit', getDiscountVsProfit);
router.get('/:datasetId/region-performance', getRegionPerformance);
router.get('/:datasetId/market-performance', getMarketPerformance);
router.get('/:datasetId/segment-performance', getSegmentPerformance);
router.get('/:datasetId/top-customers', getTopCustomers);
router.get('/:datasetId/top-products', getTopProducts);
router.get('/:datasetId/order-priority', getOrderPriority);
router.get('/:datasetId/shipping-analysis', getShippingAnalysis);

module.exports = router;
