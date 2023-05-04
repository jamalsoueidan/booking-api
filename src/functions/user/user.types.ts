import { z } from "zod";
import { BooleanOrStringType, GidFormat } from "~/library/zod";

export const UserZodSchema = z.object({
  _id: z.string(),
  customerId: GidFormat,
  title: z.string(),
  username: z
    .string()
    .transform((input) => input.replace(/[^a-zA-Z0-9-_]/g, "-")),
  fullname: z.string(),
  description: z.string(),
  social_urls: z.object({
    youtube: z.string(),
    twitter: z.string(),
    instagram: z.string(),
  }),
  active: BooleanOrStringType,
  avatar: z.string().url({ message: "Invalid url" }),
  speaks: z.array(z.string()),
});

export type User = z.infer<typeof UserZodSchema>;
