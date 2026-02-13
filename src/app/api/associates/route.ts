
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const user = await UserModel.findOne({ email: session.user.email })
            .select("associates")
            .populate({
                path: "associates",
                select: "name image headline category",
            })
            .lean();

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.associates || []);
    } catch (error) {
        console.error("Error fetching associates:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
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

        // Remove from associates
        await UserModel.findByIdAndUpdate(currentUser._id, {
            $pull: { associates: targetUserId }
        });

        return NextResponse.json({ message: "Associate removed successfully", success: true });
    } catch (error) {
        console.error("Error removing associate:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
