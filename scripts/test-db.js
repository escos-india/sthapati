const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach((line) => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('URI:', MONGODB_URI ? MONGODB_URI.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED');

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing!');
    process.exit(1);
}

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4,
})
    .then(() => {
        console.log('✅ Connection SUCCESSFUL!');
        return mongoose.connection.db.admin().ping();
    })
    .then(() => {
        console.log('✅ Ping SUCCESSFUL!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Connection FAILED:', error);
        process.exit(1);
    });
