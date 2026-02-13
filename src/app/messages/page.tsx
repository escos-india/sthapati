import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { MessageModel } from "@/models/Message";
import { getUserByEmail } from "@/lib/users";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/messages/chat-interface";
import mongoose from "mongoose";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ userId?: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect("/login");
    }

    await connectDB();
    const user = await getUserByEmail(session.user.email);
    if (!user) redirect("/login");

    const params = await searchParams;
    const selectedUserId = params.userId;

    // Fetch initial conversations list (same logic as API)
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

    const populatedConversations = await UserModel.populate(conversations, {
        path: "_id",
        select: "name image headline"
    });

    // Clean up aggregation result
    const initialConversations = populatedConversations.map((c: any) => ({
        user: c._id ? { ...c._id.toObject(), _id: c._id._id.toString() } : null,
        lastMessage: { ...c.lastMessage, _id: c.lastMessage._id.toString(), sender: c.lastMessage.sender.toString(), recipient: c.lastMessage.recipient.toString(), createdAt: c.lastMessage.createdAt.toISOString() }
    })).filter((c: any) => c.user); // Filter out if user deleted

    // If selectedUserId exists but is not in conversations (new chat), we should verify user exists and minimally pass it?
    // The ChatInterface handles empty conversation state by fetching messages which will be empty.
    // However, the selectedUser details in ChatInterface sidebar depend on it being in list OR checking current loaded.
    // If it's a new chat, we might want to inject it into 'initialConversations' or handle it in client.
    // Let's add it if missing.

    if (selectedUserId && !initialConversations.find((c: any) => c.user._id === selectedUserId)) {
        try {
            const targetUser = await UserModel.findById(selectedUserId).select("name image headline").lean();
            if (targetUser) {
                // Add placeholder conversation
                initialConversations.unshift({
                    user: { ...targetUser, _id: targetUser._id.toString() },
                    lastMessage: null
                });
            }
        } catch (e) {
            // ignore invalid ID
        }
    }

    // Convert keys to string for client component props
    const currentUser = {
        _id: String(user._id),
        name: user.name,
        image: user.image
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black/20 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <ChatInterface
                    currentUser={currentUser}
                    initialConversations={initialConversations}
                />
            </div>
        </div>
    );
}
