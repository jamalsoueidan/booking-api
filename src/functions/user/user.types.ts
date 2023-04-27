import { z } from "zod";

const stringOrBoolean = z.union([z.boolean(), z.string()]);

const stringToBoolean = stringOrBoolean.transform((value) => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    } else if (value.toLowerCase() === "false") {
      return false;
    }
  }
  return value;
});

export const UserZodSchema = z.object({
  _id: z.string(),
  fullname: z.string().nonempty().min(8),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().refine((str) => /^\d{8}$/.test(str), {
    message: "Invalid phone number format",
  }),
  active: stringToBoolean.default(true),
  avatar: z.string().url({ message: "Invalid url" }),
  position: z.string(),
  postal: z
    .number()
    .or(z.string())
    .refine(
      (value) => {
        const numberValue =
          typeof value === "string" ? parseFloat(value) : value;

        // Check if the number is positive and has at least 4 digits
        return numberValue > 0 && numberValue.toString().length >= 4;
      },
      { message: "Postal must be a positive number with a minimum of 4 digits" }
    ),
  address: z.string().nonempty(),
  group: z.string().default("all"),
  language: z.string().default("da"),
  timeZone: z.string().default("Europe/Copenhagen"),
});

export type User = z.infer<typeof UserZodSchema>;
