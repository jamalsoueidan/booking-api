import mongoose, { Document, Model } from "mongoose";
import { User } from "./user.types";

export interface IUser extends Omit<User, "_id"> {}

export interface IUserDocument extends IUser, Document {
  active: boolean;
}

export interface IUserModel extends Model<IUserDocument> {}

export const UserMongooseSchema = new mongoose.Schema<
  IUserDocument,
  IUserModel
>(
  {
    customerId: {
      type: Number,
      unique: true,
      index: true,
    },
    title: String,
    username: {
      type: String,
      unqiue: true,
      index: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    social_urls: {
      instagram: String,
      youtube: String,
      twitter: String,
    },
    description: String,
    active: { type: Boolean, default: false },
    avatar: { type: String },
    speaks: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);
