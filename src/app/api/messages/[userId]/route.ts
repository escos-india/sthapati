import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { MessageModel } from "@/models/Message";
import { getUserByEmail } from "@/lib/users";

// GET: Fetch chat history with a specific user
export async function GET(req: Request, props: { params: Promise<{ userId: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await getUserByEmail(session.user.email);
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const otherUserId = params.userId;

        // Fetch messages between current user and otherUserId
        const messages = await MessageModel.find({
            $or: [
                { sender: user._id, recipient: otherUserId },
                { sender: otherUserId, recipient: user._id }
            ]
        }).sort({ createdAt: 1 });

        return NextResponse.json(messages);

    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

// PATCH: Mark all messages from a specific sender as read
export async function PATCH(req: Request, props: { params: Promise<{ userId: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await getUserByEmail(session.user.email);
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const senderId = params.userId;

        // Mark all unread messages from this sender to me as read
        const result = await MessageModel.updateMany(
            {
                sender: senderId,
                recipient: user._id,
                read: false
            },
            { $set: { read: true } }
        );

        return NextResponse.json({
            message: "Messages marked as read",
            count: result.modifiedCount
        });

    } catch (error) {
        console.error("Error marking messages as read:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
