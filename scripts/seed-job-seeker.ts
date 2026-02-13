import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Load .env manually since we are running a script
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value && !process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
        }
    });
    console.log("Loaded environment variables from .env");
}

async function seedJobSeekers() {
    try {
        // Dynamic import to ensure env vars are loaded first
        const { connectDB } = await import("@/lib/mongodb");
        const { JobSeekerModel } = await import("@/models/JobSeeker");

        await connectDB();
        console.log("Connected to Database.");

        const dataPath = path.join(process.cwd(), "job_seeker_data.json");
        const jsonData = fs.readFileSync(dataPath, "utf-8");
        const jobSeekers = JSON.parse(jsonData);

        console.log(`Found ${jobSeekers.length} job seekers to seed.`);

        for (const seeker of jobSeekers) {
            const existing = await JobSeekerModel.findOne({ email: seeker.email });
            if (existing) {
                console.log(`Job Seeker ${seeker.email} already exists. Skipping.`);
                continue;
            }

            // Hash password
            if (seeker.password) {
                seeker.password = await bcrypt.hash(seeker.password, 10);
            }

            await JobSeekerModel.create(seeker);
            console.log(`Created Job Seeker: ${seeker.name} (${seeker.email})`);
        }

        console.log("Seeding complete.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seedJobSeekers();
