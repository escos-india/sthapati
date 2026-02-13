
import fs from 'fs';
import path from 'path';

// Manually load .env.local BEFORE importing anything that uses it
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        console.log('Loading .env.local...');
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach((line) => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                process.env[key] = value;
            }
        });
    } else {
        console.warn('Warning: .env.local not found at', envPath);
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

async function testConnection() {
    console.log('Testing MongoDB connection...');
    // Dynamic import to ensure env vars are loaded first
    const { connectDB } = await import('../src/lib/mongodb');

    console.log('URI:', process.env.MONGODB_URI?.replace(/:([^:@]+)@/, ':****@')); // Hide password

    try {
        await connectDB();
        console.log('✅ Connection SUCCESSFUL!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection FAILED:');
        console.error(JSON.stringify(error, null, 2));
        if (error instanceof Error) {
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

testConnection();

