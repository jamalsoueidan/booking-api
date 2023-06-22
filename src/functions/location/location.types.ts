import { z } from "zod";
import { GidFormat } from "~/library/zod";

export enum LocationTypes {
  RESIDENTIAL = "residential",
  COMMERICAL = "commercial",
  CLIENT = "client",
}

export const LocationZodSchema = z.object({
  _id: z.string(),
  fullAddress: z.string(),
  locationType: z.nativeEnum(LocationTypes),
  customerId: GidFormat,
});

export type Location = z.infer<typeof LocationZodSchema>;
