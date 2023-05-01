import { z } from "zod";

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
  title: z.string(),
});

export type Product = z.infer<typeof ProductZodSchema>;

export const ProductServiceUpdateBodyZodSchema = ProductZodSchema.pick({
  duration: true,
  buffertime: true,
  active: true,
});
