import mongoose from "mongoose";
import { z } from "zod";

export const BooleanOrStringType = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === "string" && value === "true") {
      return true;
    }
    return value;
  });

export const NumberOrStringType = z
  .union([z.number(), z.string()])
  .transform((value) =>
    typeof value === "string" ? parseInt(value, 10) : value
  );

export const isValidObjectId = (value: any): value is string =>
  mongoose.Types.ObjectId.isValid(value);

export const ObjectIdType = z
  .custom<string>(isValidObjectId, {
    message: "Invalid ObjectId",
  })
  .transform((value) => new mongoose.Types.ObjectId(value));

export const StringOrObjectIdType = z.union([z.string(), ObjectIdType]);
