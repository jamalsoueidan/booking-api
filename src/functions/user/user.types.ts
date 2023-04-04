import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  fullname: z.string(),
  email: z.string(),
  phone: z.string(),
  active: z.boolean().default(true),
  avatar: z.string(),
  position: z.string(),
  postal: z.number(),
  address: z.string(),
  group: z.string().default("all"),
  language: z.string().default("da"),
  timeZone: z.string().default("Europe/Copenhagen"),
});

export type User = z.infer<typeof UserSchema>;
