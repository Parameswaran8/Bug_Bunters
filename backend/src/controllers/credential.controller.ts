import User from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export default class CredentialController {
  // Method to register a new user
  static ChangePassword = asyncHandler(async (req: any, res): Promise<void> => {
    const { _id } = req.user;
    console.log("userId", _id);
    const { existingPassword, newPassword } = req.body ?? {};

    //1 Validate required fields
    if (!existingPassword || !newPassword) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        message: "Existing and new password are required",
      });
      return;
    }

    // 2. Ensure new password is not same as old one
    if (existingPassword === newPassword) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        message: "New password cannot be the same as the current password",
      });
      return;
    }

    // 3. Find user (no .lean() because we need to update)
    const user = await User.findById(_id);
    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // 4. Compare old password
    const isMatch = await bcrypt.compare(existingPassword, user.password);
    if (!isMatch) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        message: "Current password is incorrect",
      });
      return;
    }

    // 5. Extra security check: enforce password policy
    // if (newPassword.length < 8) {
    //   res.status(HttpStatusCodes.BAD_REQUEST).json({
    //     message: "New password must be at least 8 characters long",
    //   });
    //   return;
    // }

    // if jwt change ??? ask ishan monday query

    // 6. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 7. Update user password + unset defaultPassword
    await User.updateOne(
      { _id },
      {
        $set: { password: hashedPassword, resetPass: false },
        $unset: { defaultPassword: "" }, // 🔑 removes field completely
      }
    );

    res.status(HttpStatusCodes.OK).json({
      message: "Password changed successfully",
    });
  });

  // POST /auth/reset-password
  static ResetPassword = asyncHandler(async (req: any, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      res
        .status(400)
        .json({ message: "Reset token and new password required" });
      return;
    }

    let payload: any;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET!);
    } catch {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Hash & update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPass = false;
    await user.save();

    res.json({ message: "Password reset successful" });
  });
}
