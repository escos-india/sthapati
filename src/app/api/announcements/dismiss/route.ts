import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { announcementId } = await req.json();
        if (!announcementId) {
            return NextResponse.json({ message: "Announcement ID required" }, { status: 400 });
        }

        await connectDB();

        await UserModel.updateOne(
            { email: session.user.email },
            { $addToSet: { dismissedAnnouncements: new mongoose.Types.ObjectId(announcementId) } }
        );

        return NextResponse.json({ message: "Announcement dismissed" });

    } catch (error) {
        console.error("Error dismissing announcement:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
