import User from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
dotenv.config();

export default class AuthExtendController {
  // Method to register a new user []
  static Me = asyncHandler(async (req: any, res): Promise<void> => {
    console.log("Param handle", req.user);

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
      const users = req.body; // Expecting an array of user objects
      console.log("req.body", req.body);

      if (!Array.isArray(users) || users.length === 0) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "Request body must be an array of user objects",
        });
        return;
      }

      const results: any[] = [];
      const usersToInsert: any[] = [];

      // Collect all provided emails and usernames
      const emails = users
        .map((u) => u.email?.trim())
        .filter((e) => e && e.length > 0);
      const usernames = users
        .map((u) => u.username?.trim())
        .filter((u) => u && u.length > 0);

      // Fetch existing users
      const existingUsers = await User.find({
        $or: [{ email: { $in: emails } }, { username: { $in: usernames } }],
      }).lean();

      const existingEmails = new Set(existingUsers.map((u) => u.email));
      const existingUsernames = new Set(existingUsers.map((u) => u.username));

      for (const userData of users) {
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

        // Validate required fields
        if ((!email?.trim() && !username?.trim()) || !password?.trim()) {
          results.push({
            email: email || null,
            username: username || null,
            status: "failed",
            message: "Username/email and password are required",
          });
          continue;
        }

        // Check for existing email/username
        if (
          (email && existingEmails.has(email)) ||
          (username && existingUsernames.has(username))
        ) {
          let message = "User already exists";
          if (
            email &&
            existingEmails.has(email) &&
            username &&
            existingUsernames.has(username)
          ) {
            message = "Email and username already exist";
          } else if (email && existingEmails.has(email)) {
            message = "Email already exists";
          } else if (username && existingUsernames.has(username)) {
            message = "Username already exists";
          }

          results.push({
            email: email || null,
            username: username || null,
            status: "failed",
            message,
          });
          continue;
        }

        // Prepare user object for insertion
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserObj: any = {
          password: hashedPassword,
          defaultPassword: password,
          role,
          resetPass: true,
        };

        // Assign optional fields only if provided
        if (username?.trim()) newUserObj.username = username.trim();
        if (email?.trim()) newUserObj.email = email.trim();
        if (roletype) newUserObj.roletype = roletype;
        if (name) newUserObj.name = name;
        if (department) newUserObj.department = department;
        if (designation) newUserObj.designation = designation;
        if (profile) newUserObj.profile = profile;

        // ✅ Handle adminControl and adminOption only if provided and non-empty
        if (Array.isArray(adminControl) && adminControl.length > 0) {
          newUserObj.adminControl = adminControl;
        }
        if (Array.isArray(adminOption) && adminOption.length > 0) {
          newUserObj.adminOption = adminOption;
        }

        usersToInsert.push(newUserObj);

        results.push({
          email: email || null,
          username: username || null,
          status: "success",
          message: "User registered successfully",
        });
      }

      // Insert all valid users at once
      if (usersToInsert.length > 0) {
        await User.insertMany(usersToInsert);
      }

      res.status(HttpStatusCodes.CREATED).json({ results });
    }
  );

  static UpdateUserWithToken = asyncHandler(
    async (req, res): Promise<void> => {}
  );
}
