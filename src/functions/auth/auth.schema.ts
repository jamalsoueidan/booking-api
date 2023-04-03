import { genSalt, hash } from "bcryptjs";
import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { Auth, AuthRole, AuthRoleValues } from "./auth.types";

export interface IAuth extends Omit<Auth, "_id" | "userId"> {
  userId: Types.ObjectId;
}

export interface IAuthDocument extends IAuth, Document {}

export interface IAuthModel extends Model<IAuthDocument> {}

export const AuthSchema = new mongoose.Schema<IAuthDocument, IAuthModel>({
  password: { default: "12345678", type: String },
  email: {
    type: String,
    unique: true,
  },
  phone: { required: true, type: String },
  role: {
    default: AuthRole.user,
    enum: AuthRoleValues,
    required: true,
    type: Number,
  },
  group: {
    default: "all",
    index: true,
    type: String,
  },
  userId: {
    index: true,
    ref: "staff",
    type: Schema.Types.ObjectId,
    required: true,
  },
});

AuthSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await genSalt(10);
    const hashPassword = await hash(this.password || "", salt);
    this.password = hashPassword;
    return next();
  } catch (err: any) {
    return next(err);
  }
});
