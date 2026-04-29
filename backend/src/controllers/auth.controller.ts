import User from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export default class AuthController {
  // Method to register a new user with only email....
  static registerUser = asyncHandler(async (req, res): Promise<void> => {
    const { email, password } = req.body ?? {};

    // Validate required fields
    if (!email || !password) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        message: "Email and password are required",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        message: "Email already exists",
      });
      return;
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({
      email,
      password: hashedPassword,
      role: "user",
      resetPass: false,
      roletype: "bugreporter",
    }).save();

    res.status(HttpStatusCodes.CREATED).json({
      message: "User registered successfully",
    });
  });

  // Method to login user
  static loginUser = asyncHandler(async (req, res): Promise<void> => {
    const { username_email, password, keepMeSignedIn } = req.body || {};

    if (!username_email || !password) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ 
        message: "Username/email and password are required" 
      });
      return;
    }

    // Special case for initial superadmin creation/login
    if (username_email === "admin" && password === "password") {
      let user = await User.findOne({ role: "superadmin" }).lean();
      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          username: username_email,
          password: hashedPassword,
          role: "superadmin",
          roletype: ["admin", "dev", "tester", "bugreporter"],
          adminControl: ["create", "edit", "view", "delete"],
          adminOption: ["share", "generate_report", "insight_view", "export"],
          resetPass: false,
        });
        const savedUser = await newUser.save();

        const expiresIn = keepMeSignedIn ? "7d" : "1d";
        const maxAge = keepMeSignedIn ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

        const token = jwt.sign({ userId: savedUser._id }, JWT_SECRET, {
          expiresIn,
        });

        const userObj = savedUser.toObject();
        const { password: _, ...userWithoutPassword } = userObj;

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("bb_token", token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          maxAge,
          path: "/",
        });

        res.status(HttpStatusCodes.CREATED).json({
          message: "Superadmin created and logged in successfully",
          user: userWithoutPassword,
        });
        return;
      }
    }

    // Check if the user exists
    const user = await User.findOne({
      $or: [{ email: username_email }, { username: username_email }],
    }).lean();

    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ 
        message: "Invalid credentials" 
      });
      return;
    }

    const expiresIn = keepMeSignedIn ? "7d" : "1d";
    const maxAge = keepMeSignedIn ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn,
    });

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("bb_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge,
      path: "/",
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(HttpStatusCodes.OK).json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  });

  // Method to logout user
  static logout = asyncHandler(async (_req, res): Promise<void> => {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("bb_token", {
      path: "/",
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });

    res.status(HttpStatusCodes.OK).json({
      message: "Logged out",
    });
  });
}
