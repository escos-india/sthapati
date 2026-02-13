import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { CommentModel } from "@/models/Comment";
import { getUserByEmail } from "@/lib/users";
import { PostModel } from "@/models/Post";

// GET /api/posts/[id]/comments
// Actually, Next.js App Router dynamic routes are folder based.
// We need to place this file in src/app/api/posts/[id]/comments/route.ts
// But I can't pass [id] easily in this flat tool call if the directory doesn't exist.
// I'll create the directory first via write_to_file path logic? 
// Wait, the tool 'write_to_file' says: "The file and any parent directories will be created for you if they do not already exist."
// So I can just write to the full path.

// Re-using the logic from my plan.

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        await connectDB();
        const postId = params.id;

        // Fetch top-level comments (where parentComment is null)
        // We will ALSO need a way to fetch replies. 
        // For simplicity, let's fetch ALL comments for the post and organize them on client-side, 
        // OR fetch top-level and populate replies. 
        // Client-side organization is often easier for moderate comment counts.

        const comments = await CommentModel.find({ post: postId })
            .populate("author", "name image headline category")
            .sort({ createdAt: 1 }) // Oldest first usually for comments? Or Newest? Let's go Oldest first for conversation flow.
            .lean();

        return NextResponse.json(comments);

    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ message: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await getUserByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const postId = params.id;
        // Verify post exists
        const post = await PostModel.findById(postId);
        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        const { content, parentCommentId } = await req.json();

        if (!content) {
            return NextResponse.json({ message: "Content is required" }, { status: 400 });
        }

        const newComment = await CommentModel.create({
            post: postId,
            author: user._id,
            content,
            parentComment: parentCommentId || null
        });

        // Increment comment count on Post
        await PostModel.findByIdAndUpdate(postId, { $inc: { comments: 1 } });

        await newComment.populate("author", "name image headline category");

        return NextResponse.json(newComment, { status: 201 });

    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ message: "Failed to create comment" }, { status: 500 });
    }
}
