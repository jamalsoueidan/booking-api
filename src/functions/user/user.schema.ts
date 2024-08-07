import mongoose, { Document, Model } from "mongoose";
import { User } from "./user.types";

export interface IUser extends Omit<User, "_id" | "createdAt" | "updatedAt"> {
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
    userMetaobjectId: String,
    collectionMetaobjectId: String,
    articleId: Number,
    professions: {
      type: [String],
      default: [],
      index: true,
    },
    isBusiness: {
      type: Boolean,
      default: false,
      index: true,
    },
    specialties: {
      type: [String],
      default: [],
    },
    yearsExperience: Number,
    username: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    fullname: String,
    email: String, //will be updated by shopify webhook
    phone: String,
    social: {
      instagram: String,
      youtube: String,
      x: String,
      facebook: String,
    },
    aboutMe: String,
    aboutMeHtml: String,
    gender: String,
    shortDescription: String,
    active: { type: Boolean, default: false, index: true },
    images: {
      profile: {
        metaobjectId: String,
        url: String,
        width: Number,
        height: Number,
      },
    },
    speaks: {
      type: [String],
      default: [],
    },
    theme: {
      color: { type: String, default: "pink" },
    },
  },
  { timestamps: true }
);
