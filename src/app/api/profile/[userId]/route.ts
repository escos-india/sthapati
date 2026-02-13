import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { PostModel } from "@/models/Post";

export async function GET(
    req: Request,
    props: { params: Promise<{ userId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = params;

        await connectDB();
        const user = await UserModel.findById(userId)
            .select("-password -verificationToken -resetPasswordToken")
            .lean();

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Get article count
        const articleCount = await PostModel.countDocuments({ author: userId });

        return NextResponse.json({
            ...user,
            articleCount,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { message: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
