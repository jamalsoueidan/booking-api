import mongoose, { Model } from "mongoose";
import { Blocked } from "./blocked.types";

export interface IBlocked extends Omit<Blocked, "_id"> {}

export interface IBlockedDocument extends IBlocked, Document {}

export interface IBlockedModel extends Model<IBlockedDocument> {}

export const BlockedMongooseSchema = new mongoose.Schema<
  IBlockedDocument,
  IBlockedModel
>(
  {
    customerId: {
      type: Number,
      index: true,
    },
    start: {
      index: true,
      required: true,
      type: Date,
    },
    end: {
      index: true,
      required: true,
      type: Date,
    },
  },
  { timestamps: true }
);
