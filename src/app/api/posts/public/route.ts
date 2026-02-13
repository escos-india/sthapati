import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PostModel } from "@/models/Post";
import { UserModel } from "@/models/User";

export async function GET(req: Request) {
    try {
        await connectDB();

        // Find all admin users first
        const adminUsers = await UserModel.find({ isAdmin: true }).select('_id');
        const adminIds = adminUsers.map(user => user._id);

        // Fetch latest posts from Admins only
        const posts = await PostModel.find({
            author: { $in: adminIds },
            isDeleted: { $ne: true }
        })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate("author", "name image")
            .lean();

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching public posts:", error);
        return NextResponse.json({ message: "Failed to fetch posts" }, { status: 500 });
    }
}
