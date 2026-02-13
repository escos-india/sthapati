import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectDB();

        // Find users who are Open To Work AND are Students (or potentially others if requirements change)
        // For now, let's allow anyone who marks themselves as Open To Work to be visible, but we can filter by category on frontend if needed.
        // User request specifically mentioned Students adding they are open to work. 

        const talents = await UserModel.find({
            isOpenToWork: true,
            status: 'active'
        })
            .select("name headline image category specialization resume skills location email phone")
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json(talents);
    } catch (error) {
        console.error("Error fetching talents:", error);
        return NextResponse.json(
            { message: "Failed to fetch talents" },
            { status: 500 }
        );
    }
}
