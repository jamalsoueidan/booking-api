import { z } from "zod";
import { GidFormat } from "~/library/zod";

export const UserZodSchema = z.object({
  _id: z.string(),
  customerId: GidFormat,
  title: z.string(),
  username: z
    .string()
    .transform((input) => input.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase()),
  fullname: z.string(),
  description: z.string().optional(),
  social_urls: z
    .object({
      youtube: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
  //active: BooleanOrStringType,
  avatar: z.string().url({ message: "Invalid url" }).optional(),
  speaks: z.array(z.string()).optional(),
});

export type User = z.infer<typeof UserZodSchema>;
