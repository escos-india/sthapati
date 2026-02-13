import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        await connectDB();

        // Get current user to exclude self and existing associates
        const currentUser = await UserModel.findOne({ email: session.user.email }).select("_id associates");
        if (!currentUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const exclusionList = [currentUser._id, ...(currentUser.associates || [])];

        let filter: any = {
            _id: { $nin: exclusionList },
            category: { $ne: 'Student' }, // Exclude Students
            status: 'active' // Only active users
        };

        if (query && query.length >= 2) {
            filter.$or = [
                { name: { $regex: query, $options: "i" } },
                { headline: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ];
        }

        const users = await UserModel.find(filter)
            .select("name image headline category")
            .limit(5)
            .lean();

        // Randomize/Shuffle if no query (Suggestions)
        if (!query) {
            // Basic shuffle for variety
            users.sort(() => Math.random() - 0.5);
        }

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json(
            { message: "Failed to search users" },
            { status: 500 }
        );
    }
}
