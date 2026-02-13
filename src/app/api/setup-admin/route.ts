import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await connectDB();
        const email = 'saumitrakulkarni4823@gmail.com';
        const password = 'sthapati@2025';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists to preserve name/other fields if possible, or just upsert
        // We'll upsert to ensure it exists.

        // Note: We need to ensure all required fields are present if creating new.
        // Required: name, email, category, status(default pending but we want active)

        const updatedUser = await UserModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    password: hashedPassword,
                    isAdmin: true,
                    status: 'active',
                    // Only set these if creating new, but $setOnInsert isn't available in findOneAndUpdate easily mixed with $set for top level without care.
                    // Actually mongo supports mixing.
                },
                $setOnInsert: {
                    name: 'Admin User',
                    category: 'Student', // Placeholder
                    isProfileComplete: true,
                    auth_provider: 'email'
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({
            success: true,
            message: 'Admin credentials set successfully',
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin
        });
    } catch (error: any) {
        console.error("Admin setup error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
