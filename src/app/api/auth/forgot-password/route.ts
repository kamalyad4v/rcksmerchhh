import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert PasswordResetToken
    await prisma.passwordResetToken.upsert({
      where: { email },
      update: {
        token: otp,
        expiresAt,
      },
      create: {
        email,
        token: otp,
        expiresAt,
      },
    });

    // Send email
    const mailOptions = {
      from: `"RCK'S MERCHHH" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - RCK'S MERCHHH",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 30px; border: 1px solid #333; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.8);">
          <div style="text-align: center; border-bottom: 1px solid #222; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #FFD700; text-transform: uppercase; letter-spacing: 0.2em; font-size: 24px; font-weight: 900; margin: 0;">
              RCK'S <span style="color: #FFD700;">MERCHHH</span>
            </h1>
            <p style="color: #555; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin: 5px 0 0 0;">Password Recovery Service</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #ccc;">Hi ${user.name || "there"},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #ccc;">We received a request to reset your password. Use the verification code below to proceed with setting up a new password. This code will expire in <strong>10 minutes</strong>.</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <span style="display: inline-block; background-color: #111; border: 1px solid #FFD700; color: #FFD700; font-size: 32px; font-weight: 900; letter-spacing: 0.2em; padding: 15px 35px; border-radius: 8px; text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);">
              ${otp}
            </span>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #777;">If you did not request a password reset, please ignore this email or contact support. Your password will remain unchanged.</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #222; padding-top: 20px; color: #444; font-size: 12px; text-align: center;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} RCK'S MERCHHH. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
