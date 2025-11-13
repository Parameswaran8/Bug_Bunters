import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import bcrypt from "bcrypt";
import User from "../models/user.model";

export default class UserController {
  // Method to get user data with jwt token

  static UpdateUserWithToken = asyncHandler(
    async (req, res): Promise<void> => {}
  );

  // here...
  static getUserDataWithToken = asyncHandler(
    async (req, res): Promise<void> => {
      console.log("User Data:", req);
      res.status(HttpStatusCodes.OK).send(req.user);
    }
  );
}
