import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { PostModel } from "@/models/Post";
import { UserModel } from "@/models/User";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
        }

        const body = await req.json();
        const { title, content, image, tags } = body;

        if (!title || !content) {
            return NextResponse.json({ message: "Title and Content are required" }, { status: 400 });
        }

        const newPost = await PostModel.create({
            title,
            content,
            image,
            tags,
            author: user._id,
        });

        return NextResponse.json(newPost, { status: 201 });

    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user || (!user.isAdmin && (user.category as string) !== 'Admin')) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Fetch posts created by this admin ("Your Previous Posts")
        const posts = await PostModel.find({ author: user._id }).sort({ createdAt: -1 });
        return NextResponse.json(posts);

    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user || (!user.isAdmin && (user.category as string) !== 'Admin')) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const permanent = searchParams.get("permanent");

        if (permanent === 'true') {
            await PostModel.findByIdAndDelete(id);
            return NextResponse.json({ message: "Post permanently deleted" });
        } else {
            await PostModel.findByIdAndUpdate(id, { isDeleted: true });
            return NextResponse.json({ message: "Post moved to trash" });
        }

    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user || (!user.isAdmin && (user.category as string) !== 'Admin')) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { id, isDeleted } = body;

        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }

        const updatedPost = await PostModel.findByIdAndUpdate(
            id,
            { isDeleted: isDeleted },
            { new: true }
        );

        if (!updatedPost) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Post restored", post: updatedPost });

    } catch (error) {
        console.error("Error updating post:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
