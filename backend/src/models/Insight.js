const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
    dataset_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dataset',
        required: true
    },
    category: {
        type: String,
        maxlength: 50
    },
    title: {
        type: String,
        maxlength: 200
    },
    description: {
        type: String
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high']
    },
    recommendation: {
        type: String
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Insight', insightSchema);
