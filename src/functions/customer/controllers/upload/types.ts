import { z } from "zod";
import { NumberOrStringType } from "~/library/zod";

export function getFilenameFromUrl(url: string) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const segments = pathname.split("/");
  return segments.pop(); // Returns the last segment of the pathname
}

export const fileInputSchema = z.object({
  customerId: NumberOrStringType,
  resourceUrl: z.string().url(),
});

export type FileInputProps = z.infer<typeof fileInputSchema>;
