const express = require('express');
const router = express.Router();
const {
    uploadDataset,
    getDatasets,
    getDatasetById,
    getDatasetPreview,
    deleteDataset
} = require('../controllers/datasetController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect); // All dataset routes require authentication

router.post('/upload', upload.single('file'), uploadDataset);
router.get('/', getDatasets);
router.get('/:id', getDatasetById);
router.get('/:id/preview', getDatasetPreview);
router.delete('/:id', deleteDataset);

module.exports = router;
