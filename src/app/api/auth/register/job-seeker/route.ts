import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { JobSeekerModel } from "@/models/JobSeeker";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, phone } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectDB();

        const existingUser = await JobSeekerModel.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json(
                    { message: "Account already exists with this email" },
                    { status: 409 }
                );
            }
            if (phone && existingUser.phone === phone) {
                return NextResponse.json(
                    { message: "Account already exists with this phone number" },
                    { status: 409 }
                );
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await JobSeekerModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
        });

        return NextResponse.json(
            { message: "Job Seeker account created successfully", userId: newUser._id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Job Seeker Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
