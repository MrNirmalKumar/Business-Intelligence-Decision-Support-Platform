const mongoose = require('mongoose');
require('dotenv').config();
const Dataset = require('./src/models/Dataset');
const { processDatasetAnalytics } = require('./src/services/analyticsService');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bidsp')
.then(async () => {
    console.log("Reprocessing dataset...");
    await processDatasetAnalytics('6ab9e389d89f22d3da2f3a9e');
    console.log("Reprocessing complete!");
    mongoose.disconnect();
})
.catch(console.error);
