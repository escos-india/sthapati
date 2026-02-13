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

async function listJobs() {
    const { connectDB } = await import("@/lib/mongodb");
    const { JobModel } = await import("@/models/Job");
    const { UserModel } = await import("@/models/User"); // Register User model

    await connectDB();
    const jobs = await JobModel.find({}).populate('posted_by').lean();
    console.log("Total Jobs:", jobs.length);
    jobs.forEach((j: any) => {
        console.log(`Job: ${j.title}, Status: ${j.status}, Salary: ${j.salary_range}, PostedBy: ${j.posted_by ? (j.posted_by).name : 'NULL'} (${j.posted_by ? j.posted_by._id : 'N/A'})`);
    });
    process.exit(0);
}

listJobs();
