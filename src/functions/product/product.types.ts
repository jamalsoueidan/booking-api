import { z } from "zod";
import { Tag } from "../shift";

export const ProductZodSchema = z.object({
  active: z.boolean().default(false),
  buffertime: z.number().default(0),
  collectionId: z.number(),
  duration: z.number().default(60),
  hidden: z.boolean().default(false),
  imageUrl: z.string(),
  productId: z.number(),
  users: z.array(
    z.object({
      userId: z.string(),
      tag: z.nativeEnum(Tag),
    })
  ),
  title: z.string(),
});

export type Product = z.infer<typeof ProductZodSchema>;
