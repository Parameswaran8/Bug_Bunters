import User from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { createHash } from "crypto";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

import { HttpStatusCodes } from "../utils/errorCodes";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export default class ResetPasswordController {
  static RequestReset = asyncHandler(async (req: any, res) => {
    const { username_email } = req.body; // email or username
    if (!username_email) {
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: "Email or Username is required" });
      return;
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: username_email }, { username: username_email }],
    });

    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // Decide where to send OTP
    let targetEmail = user.email;

    // Case 1: User has email → send to their email
    if (!targetEmail) {
      // Case 2: No email → try superadmin
      const superAdmin = await User.findOne({ role: "superadmin" }).lean();
      if (superAdmin?.email) {
        targetEmail = superAdmin.email;
      } else {
        // Case 3: No email available at all
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "No email found for OTP send. Please contact admin.",
        });
        return;
      }
    }

    // Generate and hash OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = createHash("sha256").update(otp).digest("hex");

    // Save OTP & expiry in DB
    user.resetOtp = hashedOtp;
    user.resetOtpExpires = new Date(Date.now() + 1000 * 60 * 5); // 5 min
    await user.save();

    // Send email
    await sendEmail(targetEmail, `Your OTP is: ${otp}`);

    res
      .status(HttpStatusCodes.OK)
      .json({ message: `OTP sent successfully to ${targetEmail}` });
  });

  // POST /auth/verify-otp
  static VerifyOtp = asyncHandler(async (req: any, res) => {
    const { username_email, otp } = req.body; // can be email or username
    if (!username_email || !otp) {
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: "Email/Username and OTP are required" });
      return;
    }

    // Hash the OTP for comparison
    const hashedOtp = createHash("sha256").update(otp).digest("hex");

    // Find user by email OR username and check OTP + expiry
    const user = await User.findOne({
      $or: [{ email: username_email }, { username: username_email }],
      resetOtp: hashedOtp,
      resetOtpExpires: { $gt: new Date() }, // must not be expired
    });

    if (!user) {
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: "Invalid or expired OTP" });
      return;
    }

    // ✅ Clear OTP once verified (prevent reuse)
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    // Generate a short-lived reset token (10 min)
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "10m" }
    );

    res
      .status(HttpStatusCodes.OK)
      .json({ message: "OTP verified successfully", resetToken });
  });

  // POST /auth/reset-password
  static ResetPassword = asyncHandler(async (req: any, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: "Reset token and new password are required" });
      return;
    }

    let payload: any;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET!);
    } catch {
      res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid or expired reset token" });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // 🚫 Prevent using the old password again
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        message: "New password cannot be the same as the old password",
      });
      return;
    }

    // 🔒 Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPass = false; // mark reset complete
    user.resetOtp = undefined; // cleanup
    user.resetOtpExpires = undefined;
    await user.save();

    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Password reset successful" });
    return;
  });
}

async function sendEmail(to: string, message: string) {
  console.log(`📧 Sending email to ${to}: ${message}`);
  // TODO: Replace with nodemailer, SendGrid, SES etc.
}
