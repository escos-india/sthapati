import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { JobModel } from "@/models/Job";
import { getUserByEmail } from "@/lib/users";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const count = searchParams.get("count");

        let query = {};
        if (userId) {
            query = { posted_by: userId, status: 'active' };
        } else {
            query = { status: 'active' };
        }

        // If count parameter is present, return just the count
        if (count === 'true') {
            const jobCount = await JobModel.countDocuments(query);
            return NextResponse.json({ count: jobCount });
        }

        const jobs = await JobModel.find(query)
            .sort({ createdAt: -1 })
            .populate("posted_by", "name image category email phone")
            .lean();

        return NextResponse.json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json(
            { message: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await getUserByEmail(session.user.email);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if user is allowed to post jobs
        const allowedJobPosters = ['Architect', 'Contractor', 'Builder', 'Agency', 'Material Supplier'];

        if (!allowedJobPosters.includes(user.category)) {
            return NextResponse.json({ message: "You are not authorized to post jobs." }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, company, location, type, salary_range, requirements } = body;

        if (!title || !description || !company || !location || !type) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectDB();
        const newJob = await JobModel.create({
            title,
            description,
            company,
            location,
            type,
            salary_range,
            requirements,
            posted_by: user._id,
        });

        return NextResponse.json(newJob, { status: 201 });
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json(
            { message: "Failed to create job" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await getUserByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get("id");

        if (!jobId) {
            return NextResponse.json({ message: "Job ID required" }, { status: 400 });
        }

        await connectDB();
        const job = await JobModel.findById(jobId);

        if (!job) {
            return NextResponse.json({ message: "Job not found" }, { status: 404 });
        }

        if (job.posted_by.toString() !== user._id.toString()) {
            return NextResponse.json({ message: "Unauthorized to delete this job" }, { status: 403 });
        }

        await JobModel.findByIdAndDelete(jobId);

        return NextResponse.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json(
            { message: "Failed to delete job" },
            { status: 500 }
        );
    }
}
