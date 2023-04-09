import mongoose from "mongoose";
import { z } from "zod";
import { Tag } from "../shift";

const isObjectId = (str: string) => mongoose.Types.ObjectId.isValid(str);

export const ProductZodSchema = z.object({
  _id: z.string(),
  active: z.boolean().default(false).optional(),
  buffertime: z.number().default(0).optional(),
  collectionId: z.number(),
  duration: z.number().default(60).optional(),
  hidden: z.boolean().default(false),
  imageUrl: z.string(),
  productId: z.number(),
  users: z.array(
    z.object({
      userId: z.string().refine(isObjectId, {
        message: "String must be a valid ObjectId",
      }),
      tag: z.nativeEnum(Tag),
    })
  ),
  title: z.string(),
});

export type Product = z.infer<typeof ProductZodSchema>;

export const ProductServiceUpdateBodyZodSchema = ProductZodSchema.pick({
  duration: true,
  users: true,
  buffertime: true,
  active: true,
});
