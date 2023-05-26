import { z } from "zod";
import { GidFormat } from "~/library/zod";

export const UserZodSchema = z.object({
  _id: z.string(),
  customerId: GidFormat,
  title: z.string().optional(),
  username: z
    .string()
    .transform((input) => input.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase())
    .optional(),
  aboutMe: z.string().optional(),
  shortDescription: z.string().optional(),
  gender: z.string().optional(),
  social: z
    .object({
      youtube: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
  avatar: z.string().url({ message: "Invalid url" }).optional(),
  images: z
    .object({
      profile: z
        .object({
          url: z.string().url({ message: "Invalid url" }).optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  speaks: z.array(z.string()).optional(),
  fullname: z.string().optional(),
  active: z.boolean().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type User = z.infer<typeof UserZodSchema>;
