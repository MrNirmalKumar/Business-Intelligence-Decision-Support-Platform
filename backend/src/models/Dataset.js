const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    file_name: {
        type: String,
        required: true,
        maxlength: 255
    },
    file_type: {
        type: String,
        required: true,
        maxlength: 10
    },
    file_path: {
        type: String
    },
    row_count: {
        type: Number
    },
    status: {
        type: String,
        enum: ['uploaded', 'processing', 'processed', 'failed', 'trashed'],
        default: 'uploaded'
    }
}, { timestamps: { createdAt: 'uploaded_at', updatedAt: false } });

module.exports = mongoose.model('Dataset', datasetSchema);
