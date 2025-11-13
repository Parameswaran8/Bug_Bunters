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
    console.log("Login request body:", req.body);
    const { username_email, password } = req.body || {};

    if (!username_email || !password) {
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: "Username/email and password are required" });
      return;
    }

    if (username_email === "admin" && password === "password") {
      let user = await User.findOne({ role: "superadmin" }).lean();

      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          username: username_email,
          password: hashedPassword,
          role: "superadmin",
          resetPass: false,
        });
        const savedUser = await newUser.save();

        const token = jwt.sign({ userId: savedUser._id }, JWT_SECRET, {
          expiresIn: "48h",
        });

        const userObj = savedUser.toObject();
        const { password: _, ...userWithoutPassword } = userObj;

        res.status(HttpStatusCodes.CREATED).json({
          message: "Superadmin created and logged in successfully",
          token,
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
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "48h",
    });
    const { password: _, ...userWithoutPassword } = user;
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Login successful", token, user: userWithoutPassword });
  });
}
