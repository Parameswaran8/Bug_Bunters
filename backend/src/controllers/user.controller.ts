import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import User from "../models/user.model";
import bcrypt from "bcrypt";

export default class UserController {
  // Method to get user data with jwt token

  static UpdateUserWithToken = asyncHandler(
    async (_req, _res): Promise<void> => {}
  );

  // here...
  static getUserDataWithToken = asyncHandler(
    async (req, res): Promise<void> => {
      console.log("User Data:", req);
      res.status(HttpStatusCodes.OK).send(req.user);
    }
  );

  static changePassword = asyncHandler(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ success: false, message: "Old password and new password are required" });
        return;
      }

      if (newPassword.length < 6) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ success: false, message: "New password must be at least 6 characters" });
        return;
      }

      // Fetch user WITH password field
      const user = await User.findById(id).select("+password");
      if (!user) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: "User not found" });
        return;
      }

      // Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ success: false, message: "Old password is incorrect" });
        return;
      }

      // Hash and save new password
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      await user.save();

      res.status(HttpStatusCodes.OK).json({ success: true, message: "Password changed successfully" });
    }
  );

  static getAllUsers = asyncHandler(
    async (_req, res): Promise<void> => {
      const users = await User.find().select("-password").lean();
      res.status(HttpStatusCodes.OK).json({ success: true, data: users });
    }
  );

  static updateUser = asyncHandler(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      const updatingData = req.body;

      const updatedUser = await User.findByIdAndUpdate(id, updatingData, { new: true, runValidators: true }).select("-password");

      if (!updatedUser) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: "User not found" });
        return;
      }

      res.status(HttpStatusCodes.OK).json({ success: true, data: updatedUser, message: "User updated successfully" });
    }
  );

  static deleteUser = asyncHandler(
    async (req, res): Promise<void> => {
      const { id } = req.params;
      
      const userToDrop = await User.findById(id);
      if (!userToDrop) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: "User not found" });
        return;
      }

      if (userToDrop.role === "superadmin") {
        res.status(HttpStatusCodes.BAD_REQUEST).json({ success: false, message: "Superadmin cannot be deleted" });
        return;
      }

      await User.findByIdAndDelete(id);

      res.status(HttpStatusCodes.OK).json({ success: true, message: "User deleted successfully" });
    }
  );
}
