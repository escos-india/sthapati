import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Create Transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Sthapati" <no-reply@sthapati.com>',
      to: email,
      subject: "Verify your Email - Sthapati",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2;">Verify your Email Address</h2>
          <p>Please use the following code to verify your email address and activate your account:</p>
          <div style="background-color: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, you can ignore this email.</p>
        </div>
      `,
    };

    // Send Email
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
