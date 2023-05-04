import mongoose from "mongoose";
import { z } from "zod";

export const objectIdValidator = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId",
  });

export const BooleanOrStringType = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === "string" && value === "true") {
      return true;
    }
    return value;
  });

export const GidFormat = z
  .union([z.number(), z.string()])
  .refine(
    (value) => {
      if (typeof value === "number") {
        return true;
      } else if (typeof value === "string") {
        const gidRegex = /^gid:\/\/shopify\/[A-Za-z]+\/(\d+)$/;
        const parsedInt = parseInt(value, 10);
        return !isNaN(parsedInt) || gidRegex.test(value);
      }
      return false;
    },
    {
      message: "Invalid GidFormat. Could not parse the value.",
    }
  )
  .transform((value) => {
    if (typeof value === "number") {
      return value;
    } else {
      const gidRegex = /^gid:\/\/shopify\/[A-Za-z]+\/(\d+)$/;
      const match = gidRegex.exec(value);

      if (match) {
        return parseInt(match[1], 10);
      } else {
        return parseInt(value, 10);
      }
    }
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
