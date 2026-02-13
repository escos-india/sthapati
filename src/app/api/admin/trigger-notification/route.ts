import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MessageModel } from "@/models/Message";
import { ConnectionRequestModel } from "@/models/ConnectionRequest";
import { UserModel } from "@/models/User";
import { JobSeekerModel } from "@/models/JobSeeker";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email') || 'saumitrakulkarni4823@gmail.com';

        // Find target user
        let targetUser = await UserModel.findOne({ email });
        if (!targetUser) {
            targetUser = await JobSeekerModel.findOne({ email });
        }

        if (!targetUser) {
            return NextResponse.json({ message: "Target user not found" }, { status: 404 });
        }

        // Find or create a sender
        let sender = await UserModel.findOne({ email: 'test-sender@example.com' });
        if (!sender) {
            sender = await UserModel.create({
                name: 'Test Sender',
                email: 'test-sender@example.com',
                password: 'password123', // Dummy
                category: 'Architect',
                role: 'user'
            });
        }

        // Create Unread Message
        await MessageModel.create({
            sender: sender._id,
            recipient: targetUser._id,
            content: `Test Message at ${new Date().toISOString()}`,
            read: false
        });

        // Create Connection Request (if not exists)
        try {
            await ConnectionRequestModel.create({
                sender: sender._id,
                recipient: targetUser._id,
                status: 'pending'
            });
        } catch (e) {
            // Probably unique constraint, ignore
            console.log("Connection request may already exist");
        }

        return NextResponse.json({ message: "Notifications triggered", target: targetUser.email });

    } catch (error) {
        console.error("Error triggering notifications:", error);
        return NextResponse.json({ message: "Error", details: String(error) }, { status: 500 });
    }
}
