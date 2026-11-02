const { z } = require('zod');

const envSchema = z.object({
    PORT: z.string().default('5000'),
    MONGO_URI: z.string().min(5),
    JWT_SECRET: z.string().min(6),
    JWT_EXPIRES_IN: z.string().default('1d'),
    CLIENT_URL: z.string().default('http://localhost:5173'),
    ANALYTICS_URL: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

const validateEnv = () => {
    try {
        const envVars = envSchema.parse(process.env);
        return envVars;
    } catch (error) {
        console.error('❌ Environment Variable Validation Failed:');
        error.errors.forEach(err => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
    }
};

module.exports = validateEnv;
