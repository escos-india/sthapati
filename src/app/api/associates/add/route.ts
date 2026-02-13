import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { targetUserId } = await req.json();
        if (!targetUserId) {
            return NextResponse.json({ message: "Target user ID is required" }, { status: 400 });
        }

        await connectDB();

        const currentUser = await UserModel.findOne({ email: session.user.email });
        if (!currentUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (currentUser._id.toString() === targetUserId) {
            return NextResponse.json({ message: "Cannot add yourself" }, { status: 400 });
        }

        const targetUser = await UserModel.findById(targetUserId);
        if (!targetUser) {
            return NextResponse.json({ message: "Target user not found" }, { status: 404 });
        }

        // Check if already an associate
        const isAssociate = currentUser.associates?.some((id: any) => id.toString() === targetUserId);
        if (isAssociate) {
            return NextResponse.json({ message: "Already an associate" }, { status: 400 });
        }

        // Add to current user's associates (One-Way)
        await UserModel.findByIdAndUpdate(currentUser._id, { $addToSet: { associates: targetUser._id } });

        return NextResponse.json({ message: "Associate added successfully", success: true });
    } catch (error) {
        console.error("Error adding associate:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
