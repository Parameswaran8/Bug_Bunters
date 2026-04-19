import User from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import { sendEmail } from "../utils/mail";
import { loginOtpTemplate } from "../utils/emailTemplates";
import { createHash } from "crypto";
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
    const { username_email, password, keepMeSignedIn } = req.body || {};
    console.log("Username/Email:", username_email, "password:", password, "keepMeSignedIn:", keepMeSignedIn);

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

        res.cookie("bb_token", token, {
          httpOnly: true,
          secure: true, // true if https
          sameSite: "none",
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
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: "Invalid credentials" });
      return;
    }

    const expiresIn = keepMeSignedIn ? "7d" : "1d";
    const maxAge = keepMeSignedIn ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn,
    });

    res.cookie("bb_token", token, {
      httpOnly: true,
      secure: true, // set true for https
      sameSite: "none", // adjust if same domain: use "lax"
      maxAge, // 24 hours or 7 days
      path: "/",
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(HttpStatusCodes.OK).json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  });

  // Method to register a new user with only email....
  static logout = asyncHandler(async (_req, res): Promise<void> => {
    res.clearCookie("bb_token", {
      path: "/",
      sameSite: "none",
      secure: true,
    });

    res.status(HttpStatusCodes.OK).json({
      message: "Logged out",
    });
    return;
  });

  // Method to request OTP for login
  static requestLoginOtp = asyncHandler(async (req, res): Promise<void> => {
    const { email } = req.body || {};

    if (!email) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }

    // Generate and hash OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("OTP: ", otp);
    const hashedOtp = createHash("sha256").update(otp).digest("hex");

    // Save OTP & expiry in DB
    user.loginOtp = hashedOtp;
    user.loginOtpExpires = new Date(Date.now() + 1000 * 60 * 10); // 10 min
    await user.save();

    // Send email
    const emailSent = await sendEmail(
      email,
      "Your Login OTP",
      `Your login OTP is: ${otp}. It is valid for 10 minutes.`,
      loginOtpTemplate(otp)
    );

    if (!emailSent) {
      res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to send OTP" });
      return;
    }

    res.status(HttpStatusCodes.OK).json({ message: "OTP sent successfully" });
  });

  // Method to verify OTP and login
  static verifyLoginOtp = asyncHandler(async (req, res): Promise<void> => {
    const { email, otp, keepMeSignedIn } = req.body || {};

    if (!email || !otp) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ message: "Email and OTP are required" });
      return;
    }

    // Hash the OTP for comparison
    const hashedOtp = createHash("sha256").update(otp).digest("hex");

    // Find user by email and check OTP + expiry
    const user = await User.findOne({
      email,
      loginOtp: hashedOtp,
      loginOtpExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Clear OTP
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    // Generate JWT
    const expiresIn = keepMeSignedIn ? "7d" : "1d";
    const maxAge = keepMeSignedIn ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn,
    });

    res.cookie("bb_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge,
      path: "/",
    });

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    res.status(HttpStatusCodes.OK).json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  });
}
