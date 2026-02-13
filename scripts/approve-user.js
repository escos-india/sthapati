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

async function approveUser(email) {
    const uri = env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not defined');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();

        const result = await db.collection('users').updateOne(
            { email: email },
            {
                $set: {
                    status: 'active',
                    approved_at: new Date(),
                    approved_by_admin_id: 'manual_script'
                }
            }
        );

        if (result.matchedCount === 0) {
            console.log(`User with email ${email} not found.`);
        } else {
            console.log(`Successfully approved user: ${email}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node scripts/approve-user.js <email>');
} else {
    approveUser(email);
}
