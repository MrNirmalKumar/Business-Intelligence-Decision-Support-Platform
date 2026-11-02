require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('../config/database');
const User = require('../models/User');
const Dataset = require('../models/Dataset');
const { processDatasetAnalytics } = require('../services/analyticsService');
const path = require('path');
const fs = require('fs');

const seed = async () => {
    await connectDB();

    console.log('Seeding demo user and dataset...');

    const demoEmail = 'demo@bidsp.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash('Password123', salt);
        user = await User.create({
            name: 'Nirmal',
            email: demoEmail,
            password_hash
        });
        console.log('Demo user created: demo@bidsp.com / Password123');
    } else {
        console.log('Demo user already exists.');
    }

    // Check if demo dataset already exists
    const existingDataset = await Dataset.findOne({ user_id: user._id, file_name: 'sample_superstore.csv' });
    if (!existingDataset) {
        const sampleSource = path.join(__dirname, '../../sample_superstore.csv');
        const uploadDest = path.join(__dirname, '../../uploads/sample_superstore.csv');

        fs.copyFileSync(sampleSource, uploadDest);

        const dataset = await Dataset.create({
            user_id: user._id,
            file_name: 'sample_superstore.csv',
            file_type: 'csv',
            file_path: uploadDest,
            status: 'uploaded'
        });

        await processDatasetAnalytics(dataset._id);
        console.log('Sample dataset seeded and analyzed with Health Score & Insights!');
    } else {
        console.log('Sample dataset already exists.');
    }

    process.exit(0);
};

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
