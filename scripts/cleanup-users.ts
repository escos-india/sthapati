import { connectDB } from '../src/lib/mongodb';
import { UserModel } from '../src/models/User';
import fs from 'fs';
import path from 'path';

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

async function cleanupUsers() {
    try {
        await connectDB();
        console.log('Connected to DB. Deleting Google OAuth users...');

        const result = await UserModel.deleteMany({ auth_provider: 'google' });

        console.log(`✅ Deleted ${result.deletedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error deleting users:', error);
        process.exit(1);
    }
}

cleanupUsers();
