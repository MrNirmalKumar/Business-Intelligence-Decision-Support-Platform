const express = require('express');
const router = express.Router();
const {
    getInsights,
    getInsightById,
    getHealthScore
} = require('../controllers/insightController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getInsights);
router.get('/health-score/:datasetId', getHealthScore);
router.get('/:id', getInsightById);

module.exports = router;
