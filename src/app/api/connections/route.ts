import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { getUserByEmail } from "@/lib/users";

// GET: My connections
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await getUserByEmail(session.user.email);

        // We need to populate the connection details
        // Since we only store IDs in user.connections, we need to fetch them.
        // Option 1: Populate on the User document itself (needs refetch)
        const userWithConnections = await UserModel.findById(user._id).populate({
            path: 'connections',
            select: 'name headline image category location'
        });

        if (!userWithConnections) return NextResponse.json({ message: "User not found" }, { status: 404 });

        return NextResponse.json(userWithConnections.connections || []);

    } catch (error) {
        console.error("Error fetching connections:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
