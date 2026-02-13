import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ApplicationModel } from "@/models/Application";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserModel } from "@/models/User";
import { JobSeekerModel } from "@/models/JobSeeker";

export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        let currentUser: any = null;
        let isJobSeekerModel = false;

        // Prioritize Job Seeker if session says so
        if ((session.user as any).isJobSeeker) {
            currentUser = await JobSeekerModel.findOne({ email: session.user.email });
            if (currentUser) {
                isJobSeekerModel = true;
            }
        }

        // Fallback to User model if not found or not job seeker
        if (!currentUser) {
            currentUser = await UserModel.findOne({ email: session.user.email });
        }

        // Final fallback: check JobSeekerModel if not found in User (and wasn't checked first)
        if (!currentUser && !(session.user as any).isJobSeeker) {
            currentUser = await JobSeekerModel.findOne({ email: session.user.email });
            if (currentUser) {
                isJobSeekerModel = true;
            }
        }

        if (!currentUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if subscription is expired but status is still active
        if (currentUser.subscriptionStatus === 'active' && currentUser.subscriptionExpiry && new Date(currentUser.subscriptionExpiry) < new Date()) {
            // Update status to expired
            if (isJobSeekerModel) {
                await JobSeekerModel.findByIdAndUpdate(currentUser._id, { subscriptionStatus: 'expired' });
            } else {
                await UserModel.findByIdAndUpdate(currentUser._id, { subscriptionStatus: 'expired' });
            }
            return NextResponse.json({ message: "Subscription expired. Please renew." }, { status: 403 });
        }

        // Check subscription
        if (currentUser.subscriptionStatus !== 'active') {
            return NextResponse.json({ message: "Subscription required to apply" }, { status: 403 });
        }

        // Check category - only Job Seekers can apply
        // If they are in JobSeekerModel, they are implicitly a Job Seeker
        // If they are in UserModel, we check the category field
        if (!isJobSeekerModel && currentUser.category !== 'Job Seeker') {
            return NextResponse.json({ message: "Only Job Seekers can apply for jobs" }, { status: 403 });
        }

        const body = await req.json();
        const { jobId, resume, coverLetter } = body;

        if (!jobId || !resume) {
            return NextResponse.json({ message: "Job ID and Resume are required" }, { status: 400 });
        }

        // Check if already applied
        const existingApplication = await ApplicationModel.findOne({
            job: jobId,
            applicant: currentUser._id
        });

        if (existingApplication) {
            return NextResponse.json({ message: "You have already applied for this job" }, { status: 400 });
        }

        const application = await ApplicationModel.create({
            job: jobId,
            applicant: currentUser._id,
            resume,
            coverLetter
        });

        return NextResponse.json(application, { status: 201 });

    } catch (error) {
        console.error("Error submitting application:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
