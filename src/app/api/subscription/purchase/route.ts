import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { JobSeekerModel } from "@/models/JobSeeker";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // In a real app, verify Stripe/Payment gateway webhook here.
        // For now, simulate success.

        // Check and update BOTH models if they exist
        const userModelUser = await UserModel.findOne({ email: session.user.email });
        const jobSeekerUser = await JobSeekerModel.findOne({ email: session.user.email });

        if (!userModelUser && !jobSeekerUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const updateData = {
            subscriptionStatus: 'active',
            subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };

        if (userModelUser) {
            await UserModel.findOneAndUpdate({ email: session.user.email }, updateData);
        }

        if (jobSeekerUser) {
            await JobSeekerModel.findOneAndUpdate({ email: session.user.email }, updateData);
        }

        return NextResponse.json({ message: "Subscription activated" });

    } catch (error) {
        console.error("Purchase error", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
