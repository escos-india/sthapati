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

async function checkAdmin() {
    const uri = env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not defined');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const admin = await db.collection('users').findOne({ email: 'saumitrakulkarni4823@gmail.com' });

        if (admin) {
            console.log('Admin user found:', admin);
        } else {
            console.log('Admin user NOT found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

checkAdmin();
