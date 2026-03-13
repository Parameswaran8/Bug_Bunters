import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import User from "../models/user.model";

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
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        res.status(HttpStatusCodes.NOT_FOUND).json({ success: false, message: "User not found" });
        return;
      }

      res.status(HttpStatusCodes.OK).json({ success: true, message: "User deleted successfully" });
    }
  );
}
