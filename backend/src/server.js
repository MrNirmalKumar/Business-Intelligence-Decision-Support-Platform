require('dotenv').config();
const validateEnv = require('./config/envValidator');
const envVars = validateEnv(); // Fails fast if env vars are missing

const app = require('./app');
const connectDB = require('./config/database');

const PORT = envVars.PORT;

connectDB().then(() => {
const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    server.setTimeout(300000); // 5 minutes
});
