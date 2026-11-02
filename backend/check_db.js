const mongoose = require('mongoose');
const DatasetRecord = require('./src/models/DatasetRecord');

mongoose.connect('mongodb://127.0.0.1:27017/bidsp').then(async () => {
    console.log('Connected to MongoDB');
    
    // Get the latest dataset
    const Dataset = require('./src/models/Dataset');
    const latestDataset = await Dataset.findOne().sort({ uploaded_at: -1 });
    
    if (!latestDataset) {
        console.log('No datasets found');
        process.exit(0);
    }
    
    console.log(`Latest Dataset: ${latestDataset.file_name} (${latestDataset._id})`);
    
    // Get 5 records
    const records = await DatasetRecord.find({ dataset_id: latestDataset._id }).limit(5);
    console.log('First 5 records:');
    records.forEach(r => {
        console.log(`Date: ${r.order_date}, Sales: ${r.sales}, Category: ${r.category}, Region: ${r.region}`);
    });
    
    process.exit(0);
});
