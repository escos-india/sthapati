const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

async function checkUsers() {
    const uri = env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not defined');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const users = await db.collection('users').find({}).toArray();

        console.log('--- Users in DB ---');
        users.forEach(user => {
            console.log(`Email: ${user.email}, Category: ${user.category}, Status: ${user.status}, OTP Verified: ${user.otp_verified}`);
        });
        console.log('-------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

checkUsers();
