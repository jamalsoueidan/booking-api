import mongoose, { Document, Model } from "mongoose";
import { User } from "./user.types";

export interface IUser extends Omit<User, "_id"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {}

export const UserMongooseSchema = new mongoose.Schema<
  IUserDocument,
  IUserModel
>(
  {
    customerId: {
      type: Number,
      unique: true,
      required: true,
      index: true,
    },
    professions: {
      type: [String],
    },
    isBusiness: {
      type: Boolean,
      default: false,
    },
    specialties: {
      type: [String],
    },
    yearsExperience: Number,
    username: {
      type: String,
      unqiue: true,
      index: true,
    },
    fullname: {
      type: String,
    },
    email: {
      type: String,
      unqiue: true,
    },
    phone: {
      type: String,
    },
    social: {
      instagram: String,
      youtube: String,
      x: String,
      facebook: String,
    },
    aboutMe: String,
    gender: String,
    shortDescription: String,
    active: { type: Boolean, default: false },
    images: {
      profile: {
        url: String,
        width: Number,
        height: Number,
      },
    },
    speaks: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);
