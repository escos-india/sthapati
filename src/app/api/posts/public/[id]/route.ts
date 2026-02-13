import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PostModel } from "@/models/Post";
import { UserModel } from "@/models/User"; // Ensure model is registered

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const { id } = await params;

        const post = await PostModel.findById(id).populate("author", "name image").lean();

        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("Error fetching single post:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
