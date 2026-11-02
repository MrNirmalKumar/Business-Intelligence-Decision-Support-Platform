const mongoose = require('mongoose');
require('dotenv').config();
const Dataset = require('./src/models/Dataset');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bidsp')
.then(async () => {
    const ds = await Dataset.findById('6ab9e389d89f22d3da2f3a9e');
    console.log("Dataset upload time:");
    console.log(ds);
    mongoose.disconnect();
})
.catch(console.error);
