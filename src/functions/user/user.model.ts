import mongoose from "mongoose";
import { IUserDocument, IUserModel, UserMongooseSchema } from "./user.schema";

export const UserModel = mongoose.model<IUserDocument, IUserModel>(
  "user",
  UserMongooseSchema,
  "User"
);
