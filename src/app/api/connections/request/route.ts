import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ConnectionRequestModel } from "@/models/ConnectionRequest";
import { UserModel } from "@/models/User";
import { getUserByEmail } from "@/lib/users";
import mongoose from "mongoose";

// GET: Get pending requests for current user
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await getUserByEmail(session.user.email);
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        // Get requests where I am the recipient and status is pending
        const requests = await ConnectionRequestModel.find({
            recipient: user._id,
            status: "pending"
        }).populate("sender", "name headline image category");

        return NextResponse.json(requests);

    } catch (error) {
        console.error("Error fetching connection requests:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

// POST: Send a connection request
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { recipientId } = await req.json();
        if (!recipientId) return NextResponse.json({ message: "Recipient ID required" }, { status: 400 });

        await connectDB();
        const user = await getUserByEmail(session.user.email);
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        if (user._id.toString() === recipientId) {
            return NextResponse.json({ message: "Cannot connect with yourself" }, { status: 400 });
        }

        // Check if already connected
        if (user.connections && user.connections.includes(recipientId)) {
            return NextResponse.json({ message: "Already connected" }, { status: 400 });
        }

        // Check for existing pending request (either direction)
        const existingRequest = await ConnectionRequestModel.findOne({
            $or: [
                { sender: user._id, recipient: recipientId, status: "pending" },
                { sender: recipientId, recipient: user._id, status: "pending" }
            ]
        });

        if (existingRequest) {
            return NextResponse.json({ message: "Connection request already pending" }, { status: 400 });
        }

        const newRequest = await ConnectionRequestModel.create({
            sender: user._id,
            recipient: recipientId,
            status: "pending"
        });

        return NextResponse.json(newRequest, { status: 201 });

    } catch (error) {
        console.error("Error sending connection request:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

// PUT: Accept or Reject a request
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { requestId, action } = await req.json(); // action: 'accept' | 'reject'
        if (!requestId || !action) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

        await connectDB();
        const user = await getUserByEmail(session.user.email);

        const request = await ConnectionRequestModel.findById(requestId);
        if (!request) return NextResponse.json({ message: "Request not found" }, { status: 404 });

        // Ensure I am the recipient
        if (request.recipient.toString() !== user._id.toString()) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        if (request.status !== "pending") {
            return NextResponse.json({ message: "Request already processed" }, { status: 400 });
        }

        if (action === "accept") {
            request.status = "accepted";
            await request.save();

            // Add to connections for both users
            await UserModel.findByIdAndUpdate(user._id, { $addToSet: { connections: request.sender } });
            await UserModel.findByIdAndUpdate(request.sender, { $addToSet: { connections: user._id } });

            return NextResponse.json({ message: "Connection accepted" });

        } else if (action === "reject") {
            request.status = "rejected";
            await request.save();
            return NextResponse.json({ message: "Connection rejected" });
        } else {
            return NextResponse.json({ message: "Invalid action" }, { status: 400 });
        }

    } catch (error) {
        console.error("Error processing connection request:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
