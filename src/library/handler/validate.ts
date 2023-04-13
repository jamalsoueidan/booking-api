import mongoose from "mongoose";
import { z } from "zod";

export const isObjectId = (str: string) => mongoose.Types.ObjectId.isValid(str);

export const objectIdIsValid = (fieldName: string) =>
  z.string().refine((value) => isObjectId(value), {
    message: `${fieldName} must be a valid ObjectId`,
  });
