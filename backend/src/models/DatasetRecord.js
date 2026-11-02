const mongoose = require('mongoose');

const datasetRecordSchema = new mongoose.Schema({
    dataset_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dataset',
        required: true,
        index: true
    },
    row_id: Number,
    order_id: { type: String, index: true },
    order_date: { type: Date, index: true },
    ship_date: Date,
    ship_mode: String,
    customer_id: { type: String, index: true },
    customer_name: String,
    segment: String,
    city: String,
    state: String,
    country: String,
    postal_code: Number,
    market: String,
    region: String,
    product_id: String,
    category: String,
    sub_category: String,
    product_name: String,
    sales: Number,
    quantity: Number,
    discount: Number,
    profit: Number,
    shipping_cost: Number,
    order_priority: String
}, { timestamps: false });

datasetRecordSchema.index({ dataset_id: 1, category: 1 });
datasetRecordSchema.index({ dataset_id: 1, sub_category: 1 });
datasetRecordSchema.index({ dataset_id: 1, region: 1 });
datasetRecordSchema.index({ dataset_id: 1, market: 1 });
datasetRecordSchema.index({ dataset_id: 1, segment: 1 });
datasetRecordSchema.index({ dataset_id: 1, ship_mode: 1 });

module.exports = mongoose.model('DatasetRecord', datasetRecordSchema);
