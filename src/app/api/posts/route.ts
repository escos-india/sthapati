import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { PostModel } from "@/models/Post";
import { getUserByEmail } from "@/lib/users";

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        let query = {};
        if (userId) {
            query = { author: userId };
        }

        const posts = await PostModel.find(query)
            .sort({ createdAt: -1 })
            .populate("author", "name image category headline")
            .lean();

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json(
            { message: "Failed to fetch posts" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await getUserByEmail(session.user.email);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const { content, image, video } = await req.json();

        if (!content) {
            return NextResponse.json(
                { message: "Content is required" },
                { status: 400 }
            );
        }

        const newPost = await PostModel.create({
            author: user._id,
            content,
            image,
            video,
        });

        // Populate author details for the response
        await newPost.populate("author", "name image category headline");

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { message: "Failed to create post" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const postId = searchParams.get("id");

        if (!postId) {
            return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
        }

        const post = await PostModel.findById(postId);

        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        if (post.author.toString() !== user._id!.toString()) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        await PostModel.findByIdAndDelete(postId);

        return NextResponse.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json(
            { message: "Failed to delete post" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
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

        const { postId, action } = await req.json();

        if (!postId) {
            return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
        }

        const post = await PostModel.findById(postId);
        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        if (action === "like") {
            // Ensure likes is an array (handle legacy data)
            if (!Array.isArray(post.likes)) {
                post.likes = [];
            }

            const hasLiked = post.likes.some((id: any) => id.toString() === user._id!.toString());

            if (hasLiked) {
                // Unlike
                post.likes = post.likes.filter((id: any) => id.toString() !== user._id!.toString());
            } else {
                // Like
                post.likes.push(user._id as any);
            }
            await post.save();
            return NextResponse.json({
                success: true,
                likes: post.likes.length,
                liked: !hasLiked
            });
        }

        return NextResponse.json({ message: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Error updating post:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
