import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ message: "OTP is required" }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if OTP matches and is not expired
    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    // OTP Valid - Activate User
    user.status = 'active';
    user.phone_verified = true; // Traditionally phone_verified, using for email here as per existing logic
    user.otp = undefined; // Clear OTP
    user.otpExpiry = undefined;

    // Also set verification badge
    if (!user.verification_badges) {
      user.verification_badges = { email: false, organization: false, skill: false };

    }
    user.verification_badges.email = true;

    await user.save();

    return NextResponse.json({ message: "Verified successfully" });

  } catch (error) {
    console.error("Verification error", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
