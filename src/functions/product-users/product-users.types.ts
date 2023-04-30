import { z } from "zod";
import { isObjectId } from "~/library/handler/validate";
import { Tag } from "../shift";

export const ProductUsersZodSchema = z.object({
  _id: z.string(),
  productId: z.string().refine(isObjectId, {
    message: "userId must be a valid ObjectId",
  }),
  pid: z.number(),
  userId: z.string().refine(isObjectId, {
    message: "userId must be a valid ObjectId",
  }),
  tag: z.nativeEnum(Tag),
});

export type ProductUsers = z.infer<typeof ProductUsersZodSchema>;
