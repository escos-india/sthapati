import { loadEnvConfig } from '@next/env';
import mongoose from 'mongoose';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function checkUserStatus() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users.`);

        users.forEach(user => {
            console.log(`User: ${user.email}`);
            console.log(`  Category: ${user.category}`);
            console.log(`  Status: ${user.status}`);
            console.log(`  isProfileComplete: ${user.isProfileComplete}`);
            console.log(`  COA: ${user.coa_number}`);
            console.log(`  Phone: ${user.phone}`);
            console.log('---');
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkUserStatus();
