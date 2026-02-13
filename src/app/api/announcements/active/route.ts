import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { AnnouncementModel } from "@/models/Announcement";
import { UserModel } from "@/models/User";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        // Fetch active announcements created in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const announcements = await AnnouncementModel.find({
            isActive: true,
            isDeleted: { $ne: true },
            createdAt: { $gte: twentyFourHoursAgo }
        })
            .sort({ createdAt: -1 })
            .lean();

        if (announcements.length === 0) {
            return NextResponse.json([]);
        }

        // If user is guest, allow them to see active announcements (no dismissal filtering needed yet)
        if (!session?.user?.email) {
            return NextResponse.json(announcements);
        }

        // If user is logged in, filter out dismissed
        const user = await UserModel.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(announcements);
        }

        const dismissedIds = user.dismissedAnnouncements?.map((id: any) => id.toString()) || [];

        const filtered = activeAnnouncements.filter(a => !dismissedIds.includes(a._id.toString()));

        return NextResponse.json(filtered);

    } catch (error) {
        console.error("Error fetching active announcements:", error);
        return NextResponse.json({ message: "Failed to fetch announcements" }, { status: 500 });
    }
}
