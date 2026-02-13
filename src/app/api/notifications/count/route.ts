import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { MessageModel } from "@/models/Message";
import { ConnectionRequestModel } from "@/models/ConnectionRequest";
import { UserModel } from "@/models/User";
import { JobSeekerModel } from "@/models/JobSeeker";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Identify user (handle both User and JobSeeker)
        let userId = (session.user as any).dbId;

        // If dbId is not in session (e.g. old session), try to find them
        if (!userId) {
            const user = await UserModel.findOne({ email: session.user.email });
            if (user) userId = user._id;
            else {
                const jobSeeker = await JobSeekerModel.findOne({ email: session.user.email });
                if (jobSeeker) userId = jobSeeker._id;
            }
        }

        if (!userId) {
            console.log("[Notifications] User ID not found via session or lookup for:", session.user.email);
            return NextResponse.json({ unreadMessages: 0, pendingConnections: 0, total: 0 });
        }

        // Count unread messages
        const unreadMessages = await MessageModel.countDocuments({
            recipient: userId,
            read: false
        });

        // Count pending connection requests
        const pendingConnections = await ConnectionRequestModel.countDocuments({
            recipient: userId,
            status: 'pending'
        });

        return NextResponse.json({
            unreadMessages,
            pendingConnections,
            total: unreadMessages + pendingConnections
        });

    } catch (error) {
        console.error("Error fetching notification counts:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
