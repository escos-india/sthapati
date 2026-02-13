import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_json_url, mode } = body;

        if (!user_json_url) {
            return NextResponse.json(
                { message: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Fetch phone data from the provided URL
        const phoneRes = await fetch(user_json_url);
        const phoneData = await phoneRes.json();

        const phoneNumber = phoneData.user_phone_number;
        const countryCode = phoneData.user_country_code;
        // Construct full phone number (assuming format, adjust if necessary)
        // Adjusting logic if phone stored with or without + or code
        // For now, let's assume we match against the phone provided during registration.

        // In a real scenario, you probably want to match just the digits or ensure consistent formatting.
        // Let's rely on finding by phone or email if passed, but here we only have the phone from the auth provider.

        await connectDB();

        // Find user by phone? But registration might just have stored it.
        // If mode is Register, we expect a user to exist with this phone (provided in form) but unverified.
        // OR we just find the most recent unverified user with this phone?
        // A better approach: The registration flow should probably have set a cookie or we pass the email?
        // But the current UI doesn't pass email to this page.
        // So we must rely on the phone number matching what was entered in the registration form.

        const user = await UserModel.findOne({ phone: phoneNumber });

        if (!user) {
            return NextResponse.json(
                { message: "User not found with this phone number." },
                { status: 404 }
            );
        }

        user.phone_verified = true;
        // If the user was pending ONLY because of phone verification, update status?
        // The Schema has 'status' (pending/active).
        // If architect, kept as pending for admin approval.
        // If others, maybe auto-active?

        if (user.category !== 'Architect' && user.status === 'pending') {
            user.status = 'active';
        }

        await user.save();

        return NextResponse.json({
            message: "Phone verified successfully",
            status: user.status,
            category: user.category
        });

    } catch (error) {
        console.error("Phone verification error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
