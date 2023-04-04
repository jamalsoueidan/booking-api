import mongoose, { Document, Model } from "mongoose";
import { User } from "./user.types";

export interface IUser extends Omit<User, "_id"> {}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {}

export const UserMongooseSchema = new mongoose.Schema<
  IUserDocument,
  IUserModel
>({
  active: { default: true, type: Boolean },
  address: String,
  avatar: { required: true, type: String },
  email: {
    type: String,
    unique: true,
  },
  fullname: { required: true, type: String },
  language: {
    default: "da",
    required: true,
    type: String,
  },
  group: {
    default: "all", // should be changed later to null, nobody can see each other till they are part of group
    index: true,
    type: String,
  },
  phone: { required: true, type: String },
  position: { required: true, type: String }, // makeup? hair?
  postal: {
    index: true,
    required: true,
    type: Number,
  },
  timeZone: {
    default: "Europe/Copenhagen",
    required: true,
    type: String,
  },
});
