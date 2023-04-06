import mongoose from "mongoose";
import { z } from "zod";

export const objectIdValidator = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId",
  });
