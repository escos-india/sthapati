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

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing!');
    process.exit(1);
}

// Simple User Schema for deletion
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function cleanup() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected. Deleting Google OAuth users...');

        // Delete ONLY Google OAuth users
        const result = await User.deleteMany({ auth_provider: 'google' });
        console.log(`✅ Deleted ${result.deletedCount} Google OAuth users.`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanup();
