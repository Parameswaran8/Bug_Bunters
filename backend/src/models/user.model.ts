import mongoose, { Schema, Document } from "mongoose";

export interface UserInterface {
  name: string;
  username?: string;
  email?: string;
  password: string;
  defaultPassword: string;
  photo: string;
  role: "user" | "admin" | "superadmin";

  phone: string;
  resetPass: boolean;
  roletype: string | string[];
  resetOtp?: string;
  resetOtpExpires?: Date;
  adminControl?: ("create" | "edit" | "view" | "delete")[];
  adminOption?: ("share" | "generate_report" | "insight_view")[];
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: false, default: "" },
    username: {
      type: String,
      unique: true,
      sparse: true, // prevents duplicate index error if missing
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: { type: String, required: true },
    defaultPassword: { type: String, required: false },
    photo: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },

    phone: { type: String, default: "" },
    resetPass: { type: Boolean, default: false },
    roletype: { type: [String], enum: ["bugreporter", "tester", "dev", "admin"], required: false },
    resetOtp: { type: String, required: false },
    resetOtpExpires: { type: Date, required: false },

    // ✅ Multi-select arrays with enum validation
    adminControl: {
      type: [String],
      enum: ["create", "edit", "view", "delete"],
      required: false,
    },
    adminOption: {
      type: [String],
      enum: ["share", "generate_report", "insight_view","export"],
      required: false,
    },
  },
  { timestamps: true }
);

// Param Custom validator: Require at least one of username or email
userSchema.pre("validate", function (next) {
  if (!this.username && !this.email) {
    return next(new Error("Either username or email is required"));
  }
  next();
});

const User = mongoose.model<UserInterface & Document>("user", userSchema);
export default User;
