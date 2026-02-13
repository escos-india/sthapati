import fs from "fs";
import path from "path";

// Load .env manually
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        const key = parts[0];
        const value = parts.slice(1).join("=");
        if (key && value && !process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
        }
    });
}

async function checkImages() {
    const { connectDB } = await import("@/lib/mongodb");
    const { JobModel } = await import("@/models/Job");
    const { UserModel } = await import("@/models/User");
    const { JobSeekerModel } = await import("@/models/JobSeeker");

    await connectDB();

    console.log("--- Users ---");
    const users = await UserModel.find({}, 'name image email category').limit(10).lean();
    users.forEach((u: any) => console.log(`${u.name} (${u.category}): ${u.image}`));

    console.log("\n--- Job Seekers ---");
    const seekers = await JobSeekerModel.find({}, 'name image email').limit(10).lean();
    seekers.forEach((s: any) => console.log(`${s.name}: ${s.image}`));

    console.log("\n--- Jobs (Posted By Image) ---");
    const jobs = await JobModel.find({}).populate('posted_by', 'image').limit(5).lean();
    jobs.forEach((j: any) => {
        console.log(`Job: ${j.title} -> Poster Image: ${j.posted_by?.image}`);
    });

    process.exit(0);
}

checkImages();
