import mongoose from "mongoose";
import {
  BlockedMongooseSchema,
  IBlockedDocument,
  IBlockedModel,
} from "./blocked.schema";

export const BlockedModel = mongoose.model<IBlockedDocument, IBlockedModel>(
  "blocked",
  BlockedMongooseSchema,
  "Blocked"
);
