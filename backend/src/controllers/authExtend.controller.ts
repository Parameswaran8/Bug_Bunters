import User from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
dotenv.config();

export default class AuthExtendController {
  // Method to register a new user []
  static Me = asyncHandler(async (req: any, res): Promise<void> => {
    // console.log("Param handle", req.user);

    if (!req.user?._id) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
      return;
    }

    const user = await User.findById(req.user._id).lean();

    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({
        message: "User not found",
      });
      return;
    }

    const { password, ...safeUser } = user;

    res.status(HttpStatusCodes.OK).json({
      user: safeUser,
    });
  });

  static registerUserWithToken = asyncHandler(
    async (req, res): Promise<void> => {
      const userData = req.body; 
      console.log("req.body", req.body);

      const {
        username = "",
        email = "",
        password,
        role = "",
        name,
        department,
        designation,
        profile,
        roletype,
        adminControl,
        adminOption,
      } = userData;

      if ((!email?.trim() && !username?.trim()) || !password?.trim()) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Username/email and password are required",
        });
        return;
      }

      // Check for existing email/username
      const orConditions: any[] = [];
      if (email?.trim()) {
        orConditions.push({ email: email.trim() });
      }
      if (username?.trim()) {
        orConditions.push({ username: username.trim() });
      }

      const existingUser = await User.findOne({
        $or: orConditions,
      }).lean();

      if (existingUser) {
        let message = "User already exists";
        if (email && existingUser.email === email.trim() && username && existingUser.username === username.trim()) {
          message = "Email and username already exist";
        } else if (email && existingUser.email === email.trim()) {
          message = "Email already exists";
        } else if (username && existingUser.username === username.trim()) {
          message = "Username already exists";
        }
        res.status(HttpStatusCodes.BAD_REQUEST).json({ message });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserObj: any = {
        password: hashedPassword,
        defaultPassword: password,
        role,
        resetPass: true,
      };

      if (username?.trim()) newUserObj.username = username.trim();
      if (email?.trim()) newUserObj.email = email.trim();
      if (roletype) newUserObj.roletype = roletype;
      if (name) newUserObj.name = name;
      if (department) newUserObj.department = department;
      if (designation) newUserObj.designation = designation;
      if (profile) newUserObj.profile = profile;

      if (Array.isArray(adminControl) && adminControl.length > 0) {
        newUserObj.adminControl = adminControl;
      }
      if (Array.isArray(adminOption) && adminOption.length > 0) {
        newUserObj.adminOption = adminOption;
      }

      const newUser = new User(newUserObj);
      const savedUser = await newUser.save();

      const userObj = savedUser.toObject();
      const { password: _, ...userWithoutPassword } = userObj;

      res.status(HttpStatusCodes.CREATED).json({ 
        message: "User registered successfully", 
        user: userWithoutPassword 
      });
    }
  );

  static UpdateUserWithToken = asyncHandler(
    async (_req, _res): Promise<void> => {}
  );
}
