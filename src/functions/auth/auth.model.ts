import mongoose from "mongoose";
import { AuthSchema, IAuthDocument, IAuthModel } from "./auth.schema";

export const AuthModel = mongoose.model<IAuthDocument, IAuthModel>(
  "auth",
  AuthSchema,
  "Auth"
);
