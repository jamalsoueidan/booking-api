import { z } from "zod";
import { isObjectId } from "~/library/handler/validate";
import { Tag } from "../shift";

export const ProductZodSchema = z.object({
  _id: z.string(),
  active: z.boolean().default(false).optional(),
  buffertime: z.number().default(0).optional(),
  duration: z.number().default(60).optional(),
  hidden: z.boolean().default(false),
  image: z.object({
    url: z.string(),
    width: z.number(),
    height: z.number(),
  }),
  productId: z.number(),
  users: z.array(
    z.object({
      userId: z.string().refine(isObjectId, {
        message: "userId must be a valid ObjectId",
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
