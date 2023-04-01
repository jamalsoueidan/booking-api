import { genSalt, hash } from "bcryptjs";
import mongoose, { Document, Model } from "mongoose";
import { User, UserRole, UserRoleValues } from "./user.types";

export interface IUser extends Omit<User, "_id"> {}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {}

export const UserSchema = new mongoose.Schema<IUserDocument, IUserModel>({
  active: { default: true, type: Boolean },
  address: String,
  avatar: { required: true, type: String },
  email: {
    type: String,
    unique: true,
  },
  fullname: { required: true, type: String },
  group: {
    default: "all", // should be changed later to null, nobody can see each other till they are part of group
    index: true,
    type: String,
  },
  language: {
    default: "da",
    required: true,
    type: String,
  },
  password: { default: "12345678", type: String },
  phone: { required: true, type: String },
  position: { required: true, type: String }, // makeup? hair?
  postal: {
    index: true,
    required: true,
    type: Number,
  },
  role: {
    default: UserRole.user,
    enum: UserRoleValues,
    required: true,
    type: Number,
  },
  timeZone: {
    default: "Europe/Copenhagen",
    required: true,
    type: String,
  },
});

UserSchema.pre("save", async function save(next) {
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
