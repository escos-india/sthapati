import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import fs from 'fs';
import path from 'path';

export async function PATCH(req: Request) {
    const logPath = path.join(process.cwd(), 'debug_status.log');
    try {
        fs.appendFileSync(logPath, `${new Date().toISOString()} - API Hit: PATCH /api/user/status\n`);

        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            fs.appendFileSync(logPath, `${new Date().toISOString()} - Unauthorized: No session\n`);
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { isOpenToWork, isHiring, resume } = body;

        await connectDB();

        const updateData: any = {};
        if (typeof isOpenToWork === 'boolean') {
            updateData.isOpenToWork = isOpenToWork;
        }
        if (typeof isHiring === 'boolean') {
            updateData.isHiring = isHiring;
        }
        if (resume !== undefined) {
            updateData.resume = resume;
        }

        console.log("Updating user status:", session.user.email, updateData); // DEBUG LOG

        const user = await UserModel.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { new: true }
        ).select("isOpenToWork isHiring resume");

        console.log("Updated user result:", user); // DEBUG LOG

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }


        fs.appendFileSync(logPath, `${new Date().toISOString()} - Request: ${JSON.stringify(body)} | Update: ${JSON.stringify(updateData)} | Result: ${JSON.stringify(user)}\n`);

        return NextResponse.json(user);
    } catch (error) {

        fs.appendFileSync(logPath, `${new Date().toISOString()} - ERROR: ${error}\n`);
        console.error("Error updating status:", error);
        return NextResponse.json(
            { message: "Failed to update status" },
            { status: 500 }
        );
    }
}
