import mongoose, { Document, Model } from "mongoose";
import { Setting } from "./setting.types";

export interface ISetting extends Omit<Setting, "_id"> {}

export interface ISettingDocument extends ISetting, Document {}

export interface ISettingModel extends Model<ISettingDocument> {}

export const SettingMongooseSchema = new mongoose.Schema<
  ISettingDocument,
  ISettingModel
>({
  language: {
    default: "da",
    type: String,
  },
  status: {
    default: true,
    type: Boolean,
  },
  timeZone: {
    default: "Europe/Copenhagen",
    type: String,
  },
});
