const mongoose = require('mongoose');

const healthScoreSchema = new mongoose.Schema({
    dataset_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dataset',
        required: true
    },
    score: {
        type: Number
    },
    score_category: {
        type: String,
        maxlength: 30
    },
    breakdown: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: { createdAt: 'calculated_at', updatedAt: false } });

module.exports = mongoose.model('HealthScore', healthScoreSchema);
