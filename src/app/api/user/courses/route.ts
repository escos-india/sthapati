import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

// GET: Fetch current user's courses
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.courses || []);

    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Add new course
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.category !== 'Educational Institute') {
            return NextResponse.json({ message: "Forbidden: Educational Institutes only" }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, duration, price, media } = body;

        if (!title || !description) {
            return NextResponse.json({ message: "Title and Description are required" }, { status: 400 });
        }

        const newCourse = {
            title,
            description,
            duration,
            price,
            media: media || []
        };

        user.courses.push(newCourse);
        await user.save();

        return NextResponse.json({ message: "Course added", course: user.courses[user.courses.length - 1] }, { status: 201 });

    } catch (error) {
        console.error("Error adding course:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update course
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { id, title, description, duration, price, media } = body;

        if (!id) {
            return NextResponse.json({ message: "Course ID is required" }, { status: 400 });
        }

        const user = await UserModel.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const course = user.courses.id(id);
        if (!course) {
            return NextResponse.json({ message: "Course not found" }, { status: 404 });
        }

        // Update fields
        course.title = title || course.title;
        course.description = description || course.description;
        course.duration = duration || course.duration;
        course.price = price || course.price;
        if (media) course.media = media;

        await user.save();

        return NextResponse.json({ message: "Course updated", course });

    } catch (error) {
        console.error("Error updating course:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove course
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "Course ID is required" }, { status: 400 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.courses.pull({ _id: id });
        await user.save();

        return NextResponse.json({ message: "Course deleted" });

    } catch (error) {
        console.error("Error deleting course:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
