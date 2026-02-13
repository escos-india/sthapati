import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { MessageModel } from "@/models/Message";
import { UserModel } from "@/models/User";
import { getUserByEmail } from "@/lib/users";

// GET: List recent conversations (users usually chat with)
// This is a bit complex as we need to aggregate unique users from messages
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await getUserByEmail(session.user.email);
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        // Find all messages involving this user
        // We want to return a list of users we have chatted with, 
        // ideally with the last message.

        // This aggregation groups by the "other" person in the conversation
        const conversations = await MessageModel.aggregate([
            {
                $match: {
                    $or: [{ sender: user._id }, { recipient: user._id }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", user._id] },
                            "$recipient",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);

        // Now populate the user details for each conversation _id
        const conversationWithUserDetails = await UserModel.populate(conversations, {
            path: "_id",
            select: "name image headline"
        });

        // Format for frontend
        const result = conversationWithUserDetails.map((c: any) => ({
            user: c._id,
            lastMessage: c.lastMessage
        }));

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { recipientId, content } = await req.json();
        if (!recipientId || !content) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        await connectDB();
        const user = await getUserByEmail(session.user.email);

        // Optional: Check if connected before allowing to message
        // For now, let's assume if they have the ID they can message, 
        // OR enforce connection check.
        // User requested: "when i click on the connections i should be able to chat"
        // Implies chat is a privilege of connections. Let's enforce it for safety.

        if (!user.connections || !user.connections.map((id: any) => id.toString()).includes(recipientId)) {
            return NextResponse.json({ message: "You must be connected to message this user" }, { status: 403 });
        }

        const newMessage = await MessageModel.create({
            sender: user._id,
            recipient: recipientId,
            content
        });

        return NextResponse.json(newMessage, { status: 201 });

    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
