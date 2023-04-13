import { z } from "zod";

enum SettingLanguage {
  en = "en-US",
  da = "da-DK",
}

export const SettingZodSchema = z.object({
  _id: z.string(),
  shop: z.string(),
  language: z.nativeEnum(SettingLanguage).or(z.string()),
  timeZone: z.string(),
  status: z.boolean(),
});

export type Setting = z.infer<typeof SettingZodSchema>;
