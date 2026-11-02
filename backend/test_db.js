const mongoose = require('mongoose');
require('dotenv').config();
const DatasetRecord = require('./src/models/DatasetRecord');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bidsp')
.then(async () => {
    const record = await DatasetRecord.findOne().sort({ _id: -1 });
    console.log("Random record:");
    console.log(record);
    console.log("Order Date:", record.order_date);
    console.log("Order Date Type:", typeof record.order_date, record.order_date instanceof Date);
    
    // Aggregation test
    const trend = await DatasetRecord.aggregate([
        { $match: { dataset_id: record.dataset_id } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$order_date' } },
                sales: { $sum: '$sales' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        { $limit: 5 }
    ]);
    console.log("Aggregation trend:");
    console.log(trend);
    
    mongoose.disconnect();
})
.catch(console.error);
