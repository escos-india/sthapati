import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, category, phone, coa_number } = body;

        if (!name || !email || !password || !category) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectDB();

        const existingUser = await UserModel.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json(
                    { message: "User already exists with this email" },
                    { status: 409 }
                );
            }
            if (existingUser.phone === phone) {
                return NextResponse.json(
                    { message: "User already exists with this phone number" },
                    { status: 409 }
                );
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            category,
            phone,
            coa_number,
            auth_provider: 'email',
            status: category === 'Architect' ? 'pending' : 'active',
        });

        return NextResponse.json(
            { message: "User created successfully", userId: newUser._id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
