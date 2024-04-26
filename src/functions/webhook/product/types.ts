import { z } from "zod";

export const variantSchema = z.object({
  admin_graphql_api_id: z.string(),
  id: z.number(),
});

export const productUpdateSchema = z
  .object({
    admin_graphql_api_id: z.string(),
    handle: z.string(),
    id: z.number(),
    title: z.string(),
    variants: z.array(variantSchema),
    tags: z.string(),
  })
  .refine((data) => data.tags.includes("treatments"), {
    message: "Tags must include 'treatments'",
  });

export type ProductUpdateSchema = z.infer<typeof productUpdateSchema>;
